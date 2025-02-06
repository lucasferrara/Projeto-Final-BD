from flask import Flask, jsonify, request
from flask_cors import CORS
import pymysql
import os
from dotenv import load_dotenv
from datetime import datetime

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

def conectar_bd():
    try:
        return pymysql.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            user=os.getenv('DB_USER', 'root'),
            password=os.getenv('DB_PASSWORD', ''),
            database=os.getenv('DB_NAME', 'projeto_final_bd'),
            cursorclass=pymysql.cursors.DictCursor
        )
    except pymysql.Error as e:
        app.logger.error(f"Database connection error: {e}")
        raise

@app.route('/tables', methods=['GET'])
def get_tables():
    conexao = None
    try:
        conexao = conectar_bd()
        with conexao.cursor() as cursor:
            cursor.execute("SHOW TABLES")
            tables = [table[f'Tables_in_{os.getenv("DB_NAME", "projeto_final_bd")}'] for table in cursor.fetchall()]
            
            table_info = []
            for table in tables:
                cursor.execute(f"SELECT COUNT(*) as count FROM `{table}`")
                count = cursor.fetchone()['count']
                table_info.append({
                    'name': table,
                    'recordCount': count
                })
                
        return jsonify(table_info)
    except pymysql.Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if conexao:
            conexao.close()

@app.route('/table/<table_name>/columns')
def get_columns(table_name):
    conexao = None
    try:
        conexao = conectar_bd()
        with conexao.cursor() as cursor:
            cursor.execute("SHOW TABLES LIKE %s", (table_name,))
            if not cursor.fetchone():
                return jsonify({'error': 'Table not found'}), 404

            cursor.execute(f"SHOW COLUMNS FROM `{table_name}`")
            columns = [column['Field'] for column in cursor.fetchall()]
            
            cursor.execute(f"SHOW KEYS FROM `{table_name}` WHERE Key_name = 'PRIMARY'")
            primary_key = cursor.fetchone()['Column_name'] if cursor.rowcount > 0 else None
            
        return jsonify({'columns': columns, 'primary_key': primary_key})
    except pymysql.Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if conexao:
            conexao.close()

@app.route('/table/<table_name>', methods=['GET'])
def get_table_data(table_name):
    conexao = None
    try:
        conexao = conectar_bd()
        cursor = conexao.cursor(pymysql.cursors.DictCursor)
        
        # Get all columns
        cursor.execute(f"SHOW COLUMNS FROM `{table_name}`")
        columns = [column['Field'] for column in cursor.fetchall()]
        
        # Get all records without limit
        cursor.execute(f"SELECT * FROM `{table_name}`")
        rows = cursor.fetchall()
        
        return jsonify({
            'columns': columns,
            'rows': rows
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if conexao:
            conexao.close()

@app.route('/insert/<table_name>', methods=['POST'])
def insert_data(table_name):
    if not request.is_json:
        return jsonify({
            'error': 'Content-Type must be application/json'
        }), 400
        
    conexao = None
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        conexao = conectar_bd()
        with conexao.cursor() as cursor:
            # Validate table name
            cursor.execute("SHOW TABLES LIKE %s", (table_name,))
            if not cursor.fetchone():
                return jsonify({'error': f'Table {table_name} not found'}), 404

            # Get the primary key column
            cursor.execute(f"SHOW KEYS FROM `{table_name}` WHERE Key_name = 'PRIMARY'")
            primary_key = cursor.fetchone()['Column_name']

            # Get the current max ID
            cursor.execute(f"SELECT COALESCE(MAX(`{primary_key}`), 0) as max_id FROM `{table_name}`")
            next_id = cursor.fetchone()['max_id'] + 1

            # Get columns for the table
            cursor.execute(f"SHOW COLUMNS FROM `{table_name}`")
            columns = cursor.fetchall()
            
            # Include all columns including the primary key
            valid_columns = [col['Field'] for col in columns]
            
            # Prepare the data with the next ID
            insert_data = {primary_key: next_id}
            
            for col in valid_columns:
                if col in data and col != primary_key:
                    # Handle datetime fields
                    if any(dt_type in next(c['Type'] for c in columns if c['Field'] == col).lower() 
                          for dt_type in ['datetime', 'timestamp']):
                        try:
                            dt = datetime.strptime(data[col], '%Y-%m-%d %H:%M:%S')
                            insert_data[col] = dt.strftime('%Y-%m-%d %H:%M:%S')
                        except ValueError:
                            return jsonify({
                                'error': f'Invalid datetime format for {col}. Use YYYY-MM-DD HH:MM:SS'
                            }), 400
                    else:
                        insert_data[col] = data[col]

            if len(insert_data) <= 1:  # Only has ID
                return jsonify({'error': 'No valid columns to insert'}), 400

            # Build and execute the query
            columns_str = ', '.join(f"`{col}`" for col in insert_data.keys())
            values_str = ', '.join('%s' for _ in insert_data)
            query = f"INSERT INTO `{table_name}` ({columns_str}) VALUES ({values_str})"
            
            print(f"Query: {query}")  # Debug log
            print(f"Values: {list(insert_data.values())}")  # Debug log
            
            cursor.execute(query, list(insert_data.values()))
            conexao.commit()

            return jsonify({
                'message': 'Data inserted successfully',
                'inserted_id': next_id
            }), 201

    except pymysql.Error as e:
        print(f"Database error: {str(e)}")  # Debug log
        return jsonify({'error': f'Database error: {str(e)}'}), 500
    except Exception as e:
        print(f"Server error: {str(e)}")  # Debug log
        return jsonify({'error': f'Server error: {str(e)}'}), 500
    finally:
        if conexao:
            conexao.close()

@app.route('/table/<table_name>/record/<record_id>')
def get_record(table_name, record_id):
    try:
        conexao = conectar_bd()
        with conexao.cursor() as cursor:
            # Validate table name
            cursor.execute("SHOW TABLES LIKE %s", (table_name,))
            if not cursor.fetchone():
                return jsonify({'error': 'Table not found'}), 404

            cursor.execute(f"SHOW KEYS FROM `{table_name}` WHERE Key_name = 'PRIMARY'")
            primary_key = cursor.fetchone()['Column_name']
            
            cursor.execute(f"SELECT * FROM `{table_name}` WHERE `{primary_key}` = %s", (record_id,))
            record = cursor.fetchone()
            
            if record:
                return jsonify(record)
            else:
                return jsonify({'error': 'Record not found'}), 404
    except pymysql.Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conexao.close()

@app.route('/table/<table_name>/update/<record_id>', methods=['PUT'])
def update_data(table_name, record_id):
    try:
        conexao = conectar_bd()
        with conexao.cursor() as cursor:
            # Validate table name
            cursor.execute("SHOW TABLES LIKE %s", (table_name,))
            if not cursor.fetchone():
                return jsonify({'error': 'Table not found'}), 404

            data = request.json
            if not data:
                return jsonify({'error': 'No data provided'}), 400

            # Get primary key
            cursor.execute(f"SHOW KEYS FROM `{table_name}` WHERE Key_name = 'PRIMARY'")
            primary_key = cursor.fetchone()['Column_name']

            # Validate columns
            cursor.execute(f"SHOW COLUMNS FROM `{table_name}`")
            valid_columns = {column['Field'] for column in cursor.fetchall()}
            
            # Filter out primary key and invalid columns
            filtered_data = {k: v for k, v in data.items() 
                             if k in valid_columns and k != primary_key}
            
            if not filtered_data:
                return jsonify({'error': 'No valid columns to update'}), 400

            set_clause = ', '.join([f"`{key}` = %s" for key in filtered_data.keys()])
            query = f"UPDATE `{table_name}` SET {set_clause} WHERE `{primary_key}` = %s"
            
            cursor.execute(query, list(filtered_data.values()) + [record_id])
            conexao.commit()

            if cursor.rowcount > 0:
                return jsonify({
                    'message': 'Data updated successfully', 
                    'rows_affected': cursor.rowcount
                }), 200
            else:
                return jsonify({'error': 'Record not found or no changes made'}), 404
    except pymysql.Error as e:
        conexao.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        conexao.close()

@app.route('/table/<table_name>/count')
def get_table_count(table_name):
    try:
        conn = conectar_bd()
        cursor = conn.cursor()
        
        cursor.execute(f"SELECT COUNT(*) as count FROM {table_name}")
        count = cursor.fetchone()['count']
        
        return jsonify({"count": count})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5000)