from flask import Flask, jsonify, request
from flask_cors import CORS
import couchdb

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

COUCHDB_USER = 'admin'
COUCHDB_PASSWORD = 'unifesp'
COUCHDB_URL = f'http://{COUCHDB_USER}:{COUCHDB_PASSWORD}@localhost:5984/'

DBS = {
    'eventos': 'eventos',
    'participantes': 'participantes',
    'organizadores': 'organizadores',
    'revistas': 'revistas',
    'artigos': 'artigos',
    'areas_cientificas': 'areas_cientificas'
}

def get_db(db_key):
    couch = couchdb.Server(COUCHDB_URL)
    db = couch[DBS[db_key]]
    return db

# --- EVENTOS ---
@app.route('/eventos', methods=['GET'])
def listar_eventos():
    db = get_db('eventos')
    eventos = [db[doc_id] for doc_id in db]
    return jsonify(eventos)

@app.route('/eventos/<evento_id>', methods=['GET'])
def obter_evento(evento_id):
    db = get_db('eventos')
    if evento_id in db:
        return jsonify(db[evento_id])
    else:
        return jsonify({'error': 'Evento não encontrado'}), 404

@app.route('/eventos', methods=['POST'])
def criar_evento():
    db = get_db('eventos')
    data = request.get_json()
    if not data or '_id' not in data:
        return jsonify({'error': 'Dados inválidos ou _id ausente'}), 400
    if data['_id'] in db:
        return jsonify({'error': 'Evento com esse _id já existe'}), 400
    db.save(data)
    return jsonify({'message': 'Evento criado com sucesso', 'id': data['_id']}), 201

@app.route('/eventos/<evento_id>', methods=['PUT'])
def atualizar_evento(evento_id):
    db = get_db('eventos')
    if evento_id not in db:
        return jsonify({'error': 'Evento não encontrado'}), 404
    data = request.get_json()
    evento = db[evento_id]
    for key, value in data.items():
        if key not in ['_id', '_rev']:
            evento[key] = value
    db.save(evento)
    return jsonify({'message': 'Evento atualizado com sucesso'})

@app.route('/eventos/<evento_id>', methods=['DELETE'])
def deletar_evento(evento_id):
    db = get_db('eventos')
    if evento_id not in db:
        return jsonify({'error': 'Evento não encontrado'}), 404
    db.delete(db[evento_id])
    return jsonify({'message': 'Evento deletado com sucesso'})

# --- PARTICIPANTES ---
@app.route('/participantes', methods=['GET'])
def listar_participantes():
    db = get_db('participantes')
    participantes = [db[doc_id] for doc_id in db]
    return jsonify(participantes)

@app.route('/participantes/<participante_id>', methods=['GET'])
def obter_participante(participante_id):
    db = get_db('participantes')
    if participante_id in db:
        return jsonify(db[participante_id])
    else:
        return jsonify({'error': 'Participante não encontrado'}), 404

@app.route('/participantes', methods=['POST'])
def criar_participante():
    db = get_db('participantes')
    data = request.get_json()
    if not data or '_id' not in data:
        return jsonify({'error': 'Dados inválidos ou _id ausente'}), 400
    if data['_id'] in db:
        return jsonify({'error': 'Participante com esse _id já existe'}), 400
    db.save(data)
    return jsonify({'message': 'Participante criado com sucesso', 'id': data['_id']}), 201

@app.route('/participantes/<participante_id>', methods=['PUT'])
def atualizar_participante(participante_id):
    db = get_db('participantes')
    if participante_id not in db:
        return jsonify({'error': 'Participante não encontrado'}), 404
    data = request.get_json()
    participante = db[participante_id]
    for key, value in data.items():
        if key not in ['_id', '_rev']:
            participante[key] = value
    db.save(participante)
    return jsonify({'message': 'Participante atualizado com sucesso'})

@app.route('/participantes/<participante_id>', methods=['DELETE'])
def deletar_participante(participante_id):
    db = get_db('participantes')
    if participante_id not in db:
        return jsonify({'error': 'Participante não encontrado'}), 404
    db.delete(db[participante_id])
    return jsonify({'message': 'Participante deletado com sucesso'})

# --- ORGANIZADORES ---
@app.route('/organizadores', methods=['GET'])
def listar_organizadores():
    db = get_db('organizadores')
    organizadores = [db[doc_id] for doc_id in db]
    return jsonify(organizadores)

@app.route('/organizadores/<organizador_id>', methods=['GET'])
def obter_organizador(organizador_id):
    db = get_db('organizadores')
    if organizador_id in db:
        return jsonify(db[organizador_id])
    else:
        return jsonify({'error': 'Organizador não encontrado'}), 404

@app.route('/organizadores', methods=['POST'])
def criar_organizador():
    db = get_db('organizadores')
    data = request.get_json()
    if not data or '_id' not in data:
        return jsonify({'error': 'Dados inválidos ou _id ausente'}), 400
    if data['_id'] in db:
        return jsonify({'error': 'Organizador com esse _id já existe'}), 400
    db.save(data)
    return jsonify({'message': 'Organizador criado com sucesso', 'id': data['_id']}), 201

@app.route('/organizadores/<organizador_id>', methods=['PUT'])
def atualizar_organizador(organizador_id):
    db = get_db('organizadores')
    if organizador_id not in db:
        return jsonify({'error': 'Organizador não encontrado'}), 404
    data = request.get_json()
    organizador = db[organizador_id]
    for key, value in data.items():
        if key not in ['_id', '_rev']:
            organizador[key] = value
    db.save(organizador)
    return jsonify({'message': 'Organizador atualizado com sucesso'})

@app.route('/organizadores/<organizador_id>', methods=['DELETE'])
def deletar_organizador(organizador_id):
    db = get_db('organizadores')
    if organizador_id not in db:
        return jsonify({'error': 'Organizador não encontrado'}), 404
    db.delete(db[organizador_id])
    return jsonify({'message': 'Organizador deletado com sucesso'})

# --- REVISTAS ---
@app.route('/revistas', methods=['GET'])
def listar_revistas():
    db = get_db('revistas')
    revistas = [db[doc_id] for doc_id in db]
    return jsonify(revistas)

@app.route('/revistas/<revista_id>', methods=['GET'])
def obter_revista(revista_id):
    db = get_db('revistas')
    if revista_id in db:
        return jsonify(db[revista_id])
    else:
        return jsonify({'error': 'Revista não encontrada'}), 404

@app.route('/revistas', methods=['POST'])
def criar_revista():
    db = get_db('revistas')
    data = request.get_json()
    if not data or '_id' not in data:
        return jsonify({'error': 'Dados inválidos ou _id ausente'}), 400
    if data['_id'] in db:
        return jsonify({'error': 'Revista com esse _id já existe'}), 400
    db.save(data)
    return jsonify({'message': 'Revista criada com sucesso', 'id': data['_id']}), 201

@app.route('/revistas/<revista_id>', methods=['PUT'])
def atualizar_revista(revista_id):
    db = get_db('revistas')
    if revista_id not in db:
        return jsonify({'error': 'Revista não encontrada'}), 404
    data = request.get_json()
    revista = db[revista_id]
    for key, value in data.items():
        if key not in ['_id', '_rev']:
            revista[key] = value
    db.save(revista)
    return jsonify({'message': 'Revista atualizada com sucesso'})

@app.route('/revistas/<revista_id>', methods=['DELETE'])
def deletar_revista(revista_id):
    db = get_db('revistas')
    if revista_id not in db:
        return jsonify({'error': 'Revista não encontrada'}), 404
    db.delete(db[revista_id])
    return jsonify({'message': 'Revista deletada com sucesso'})

# --- ARTIGOS ---
@app.route('/artigos', methods=['GET'])
def listar_artigos():
    db = get_db('artigos')
    artigos = [db[doc_id] for doc_id in db]
    return jsonify(artigos)

@app.route('/artigos/<artigo_id>', methods=['GET'])
def obter_artigo(artigo_id):
    db = get_db('artigos')
    if artigo_id in db:
        return jsonify(db[artigo_id])
    else:
        return jsonify({'error': 'Artigo não encontrado'}), 404

@app.route('/artigos', methods=['POST'])
def criar_artigo():
    db = get_db('artigos')
    data = request.get_json()
    if not data or '_id' not in data:
        return jsonify({'error': 'Dados inválidos ou _id ausente'}), 400
    if data['_id'] in db:
        return jsonify({'error': 'Artigo com esse _id já existe'}), 400
    db.save(data)
    return jsonify({'message': 'Artigo criado com sucesso', 'id': data['_id']}), 201

@app.route('/artigos/<artigo_id>', methods=['PUT'])
def atualizar_artigo(artigo_id):
    db = get_db('artigos')
    if artigo_id not in db:
        return jsonify({'error': 'Artigo não encontrado'}), 404
    data = request.get_json()
    artigo = db[artigo_id]
    for key, value in data.items():
        if key not in ['_id', '_rev']:
            artigo[key] = value
    db.save(artigo)
    return jsonify({'message': 'Artigo atualizado com sucesso'})

@app.route('/artigos/<artigo_id>', methods=['DELETE'])
def deletar_artigo(artigo_id):
    db = get_db('artigos')
    if artigo_id not in db:
        return jsonify({'error': 'Artigo não encontrado'}), 404
    db.delete(db[artigo_id])
    return jsonify({'message': 'Artigo deletado com sucesso'})

# --- AREAS CIENTIFICAS ---
@app.route('/areas_cientificas', methods=['GET'])
def listar_areas():
    db = get_db('areas_cientificas')
    areas = [db[doc_id] for doc_id in db]
    return jsonify(areas)

@app.route('/areas_cientificas/<area_id>', methods=['GET'])
def obter_area(area_id):
    db = get_db('areas_cientificas')
    if area_id in db:
        return jsonify(db[area_id])
    else:
        return jsonify({'error': 'Área científica não encontrada'}), 404

@app.route('/areas_cientificas', methods=['POST'])
def criar_area():
    db = get_db('areas_cientificas')
    data = request.get_json()
    if not data or '_id' not in data:
        return jsonify({'error': 'Dados inválidos ou _id ausente'}), 400
    if data['_id'] in db:
        return jsonify({'error': 'Área científica com esse _id já existe'}), 400
    db.save(data)
    return jsonify({'message': 'Área científica criada com sucesso', 'id': data['_id']}), 201

@app.route('/areas_cientificas/<area_id>', methods=['PUT'])
def atualizar_area(area_id):
    db = get_db('areas_cientificas')
    if area_id not in db:
        return jsonify({'error': 'Área científica não encontrada'}), 404
    data = request.get_json()
    area = db[area_id]
    for key, value in data.items():
        if key not in ['_id', '_rev']:
            area[key] = value
    db.save(area)
    return jsonify({'message': 'Área científica atualizada com sucesso'})

@app.route('/areas_cientificas/<area_id>', methods=['DELETE'])
def deletar_area(area_id):
    db = get_db('areas_cientificas')
    if area_id not in db:
        return jsonify({'error': 'Área científica não encontrada'}), 404
    db.delete(db[area_id])
    return jsonify({'message': 'Área científica deletada com sucesso'})

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5000)