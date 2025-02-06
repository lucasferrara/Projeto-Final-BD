'use client'
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { TableIcon } from "lucide-react"
import { Toaster, toast } from "sonner"

const InsertData = () => {
  const [tables, setTables] = useState([])
  const [selectedTable, setSelectedTable] = useState("")
  const [columns, setColumns] = useState([])
  const [formData, setFormData] = useState({})

  useEffect(() => {
    fetchTables()
  }, [])

  const fetchTables = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/tables")
      const data = await response.json()
      setTables(data)
    } catch (error) {
      console.error("Error fetching tables:", error)
    }
  }

  const fetchColumns = async (tableName) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/table/${tableName}/columns`)
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json()
      setColumns(data.columns.filter(col => col !== data.primary_key))
      setFormData({})
    } catch (error) {
      console.error("Error fetching columns:", error)
    }
  }

  const handleTableSelect = (tableName) => {
    setSelectedTable(tableName)
    fetchColumns(tableName)
  }

  const handleInputChange = (column, value) => {
    setFormData(prev => ({
      ...prev,
      [column]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const loadingToast = toast.loading('Inserindo dados...', {
      description: 'Por favor, aguarde enquanto os dados são inseridos.',
      style: {
        background: 'white',
        border: '1px solid #e2e8f0',
      }
    })
    
    try {
      const response = await fetch(`http://localhost:5000/insert/${selectedTable}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Falha ao inserir dados')
      }

      toast.dismiss(loadingToast)
      toast.custom((t) => (
        <div className="bg-green-50 border border-green-200 px-6 py-4 rounded-lg shadow-lg">
          <div className="flex items-center gap-3">
            <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-green-900">
                Dados inseridos com sucesso!
              </h3>
              <p className="text-green-700 text-sm mt-1">
                Os dados foram salvos no banco de dados.
              </p>
            </div>
          </div>
        </div>
      ), {
        duration: 3000,
        position: 'top-center',
      })
      
      setFormData({})
    } catch (error) {
      toast.dismiss(loadingToast)
      toast.error('Erro ao inserir dados', {
        description: error.message,
        duration: 4000,
        position: 'top-center',
        style: {
          background: '#FEE2E2',
          border: '1px solid #FECACA',
          color: '#991B1B',
        }
      })
      console.error("Error inserting data:", error)
    }
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6 bg-green-600 bg-clip-text text-transparent">
        Inserção de Dados
      </h1>

      <h2 className="text-lg font-medium text-gray-700 mb-4">
        Selecione uma tabela
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-6">
        {tables.map((table) => (
          <div
            key={table.name}
            className={`rounded-md ${
              selectedTable === table.name 
                ? "p-[1px] bg-gradient-to-r from-blue-700 to-purple-700" 
                : ""
            }`}
          >
            <Button
              onClick={() => handleTableSelect(table.name)}
              variant="outline"
              className={`w-full justify-start ${
                selectedTable === table.name 
                  ? "border-0 bg-white hover:bg-blue-50" 
                  : "text-gray-700 hover:bg-gray-50 border-gray-200"
              }`}
            >
              <TableIcon className="mr-2 h-4 w-4" />
              {table.name}
            </Button>
          </div>
        ))}
      </div>

      {selectedTable && columns.length > 0 && (
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-medium text-gray-700 mb-4">
            Insira abaixo os dados corretamente
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {columns.map((column) => (
              <div key={`${selectedTable}-${column}`} className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {column}
                </label>
                <Input
                  type="text"
                  value={formData[column] || ""}
                  onChange={(e) => handleInputChange(column, e.target.value)}
                  placeholder={`Enter ${column}`}
                  className="w-full"
                  required
                />
              </div>
            ))}
            <Button 
              type="submit"
              className="w-full bg-gradient-to-r from-blue-700 to-purple-700 text-white hover:from-blue-800 hover:to-purple-800"
            >
              Inserir Dados
            </Button>
          </form>
        </div>
      )}
    </div>
  )
}

export default InsertData