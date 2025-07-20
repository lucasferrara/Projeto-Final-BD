'use client'
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { TableIcon } from "lucide-react"
import { Toaster, toast } from "sonner"

// Schemas básicos para cada entidade (pode ser expandido conforme necessário)
const ENTITY_SCHEMAS = {
  eventos: [
    '_id', 'tipo', 'nome', 'local', 'descricao', 'data_inicio', 'data_fim', 'participantes', 'organizadores', 'apresentacoes'
  ],
  participantes: [
    '_id', 'tipo', 'email', 'instituicao', 'nome', 'categoria', 'semestre', 'curso', 'areas_de_pesquisa', 'titulos_academicos', 'eventos_participados', 'artigos_publicados'
  ],
  organizadores: [
    '_id', 'tipo', 'instituicao', 'nome', 'contato', 'eventos_organizados'
  ],
  revistas: [
    '_id', 'tipo', 'nome', 'editora', 'issn', 'artigos_publicados'
  ],
  artigos: [
    '_id', 'tipo', 'titulo', 'resumo', 'data_publicacao', 'revista', 'autores', 'areas_cientificas', 'apresentacoes'
  ],
  areas_cientificas: [
    '_id', 'tipo', 'nome', 'descricao', 'artigos'
  ]
}

const ENTITY_LABELS = {
  eventos: 'Eventos',
  participantes: 'Participantes',
  organizadores: 'Organizadores',
  revistas: 'Revistas',
  artigos: 'Artigos',
  areas_cientificas: 'Áreas Científicas'
}

const InsertData = () => {
  const [selectedEntity, setSelectedEntity] = useState("")
  const [formData, setFormData] = useState({})

  const handleEntitySelect = (entity) => {
    setSelectedEntity(entity)
    setFormData({})
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
      const response = await fetch(`http://localhost:5000/${selectedEntity}`, {
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
      toast.success('Dados inseridos com sucesso!', {
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
        Selecione uma entidade
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-6">
        {Object.keys(ENTITY_LABELS).map((entity) => (
          <div
            key={entity}
            className={`rounded-md ${
              selectedEntity === entity 
                ? "p-[1px] bg-gradient-to-r from-blue-700 to-purple-700" 
                : ""
            }`}
          >
            <Button
              onClick={() => handleEntitySelect(entity)}
              variant="outline"
              className={`w-full justify-start ${
                selectedEntity === entity 
                  ? "border-0 bg-white hover:bg-blue-50" 
                  : "text-gray-700 hover:bg-gray-50 border-gray-200"
              }`}
            >
              <TableIcon className="mr-2 h-4 w-4" />
              {ENTITY_LABELS[entity]}
            </Button>
          </div>
        ))}
      </div>
      {selectedEntity && (
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-medium text-gray-700 mb-4">
            Insira abaixo os dados corretamente
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {ENTITY_SCHEMAS[selectedEntity].map((column) => (
              <div key={`${selectedEntity}-${column}`} className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {column}
                </label>
                <Input
                  type="text"
                  value={formData[column] || ""}
                  onChange={(e) => handleInputChange(column, e.target.value)}
                  placeholder={`Enter ${column}`}
                  className="w-full"
                  required={column === '_id'}
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