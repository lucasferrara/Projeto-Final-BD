'use client'
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { TableIcon, ChevronLeftIcon, ChevronRightIcon, SearchIcon } from "lucide-react"
import { Toaster, toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

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

const UpdateData = () => {
  const [selectedEntity, setSelectedEntity] = useState("")
  const [records, setRecords] = useState([])
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [formData, setFormData] = useState({})
  const [currentPage, setCurrentPage] = useState(1)
  const recordsPerPage = 5 
  const [searchColumn, setSearchColumn] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  const fetchEntityData = async (entity) => {
    try {
      const response = await fetch(`http://localhost:5000/${entity}`)
      const data = await response.json()
      setRecords(data)
    } catch (error) {
      toast.error("Erro ao buscar dados da entidade")
      setRecords([])
    }
  }

  const handleEntitySelect = (entity) => {
    setSelectedEntity(entity)
    setSelectedRecord(null)
    setFormData({})
    setCurrentPage(1)
    fetchEntityData(entity)
  }

  const handleRecordSelect = (record) => {
    setSelectedRecord(record)
    setFormData(record)
  }

  const handleInputChange = (column, value) => {
    setFormData(prev => ({
      ...prev,
      [column]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const loadingToast = toast.loading('Atualizando registro...')
    try {
      const recordId = selectedRecord['_id']
      const response = await fetch(`http://localhost:5000/${selectedEntity}/${recordId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Falha ao atualizar dados')
      }
      toast.dismiss(loadingToast)
      toast.success('Registro atualizado com sucesso!', {
        duration: 3000,
        position: 'top-center',
      })
      fetchEntityData(selectedEntity)
      setSelectedRecord(null)
      setFormData({})
    } catch (error) {
      toast.dismiss(loadingToast)
      toast.error(`Erro ao atualizar: ${error.message}`, {
        duration: 4000,
        position: 'top-center',
      })
    }
  }

  // Filter and sort records
  const filteredRecords = records.filter(record => {
    if (!searchQuery || !searchColumn) return true
    const value = String(record[searchColumn] || '').toLowerCase()
    return value.includes(searchQuery.toLowerCase())
  })

  const indexOfLastRecord = currentPage * recordsPerPage
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage
  const currentRecords = filteredRecords.slice(indexOfFirstRecord, indexOfLastRecord)
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / recordsPerPage))

  const formatCellValue = (value) => {
    if (value === null || value === undefined) return ''
    if (Array.isArray(value)) return JSON.stringify(value)
    if (typeof value === 'object') return JSON.stringify(value)
    return value
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6 max-w-4xl mx-auto">
      <Toaster 
        theme="light"
        closeButton
        richColors
      />
      <h1 className="text-2xl font-semibold mb-6 bg-gradient-to-r from-purple-600 to-purple-600 bg-clip-text text-transparent">
        Atualização de Dados
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
      {selectedEntity && records.length > 0 && (
        <>
          <div className="flex gap-4 mb-4">
            <Select
              value={searchColumn}
              onValueChange={setSearchColumn}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Selecione a coluna" />
              </SelectTrigger>
              <SelectContent>
                {ENTITY_SCHEMAS[selectedEntity].map(column => (
                  <SelectItem key={column} value={column}>
                    {column}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Pesquisar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                disabled={!searchColumn}
              />
            </div>
          </div>
          <div className="relative border rounded-lg overflow-x-auto">
            <div className="w-full">
              <Table>
                <TableHeader className="bg-blue-700 [&_tr]:hover:bg-transparent">
                  <TableRow>
                    {ENTITY_SCHEMAS[selectedEntity].map((column, index) => (
                      <TableHead 
                        key={column} 
                        className={`text-white font-medium min-w-[200px]`}
                      >
                        {column}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentRecords.map((record, rowIndex) => (
                    <TableRow 
                      key={`${selectedEntity}-row-${rowIndex}-${record._id}`}
                      onClick={() => handleRecordSelect(record)}
                      className={`cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedRecord === record ? "bg-blue-50" : ""
                      }`}
                    >
                      {ENTITY_SCHEMAS[selectedEntity].map((column, colIndex) => (
                        <TableCell 
                          key={`${selectedEntity}-cell-${rowIndex}-${colIndex}-${record._id}`}
                          className={`min-w-[200px] relative`}
                        >
                          {formatCellValue(record[column])}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
          <div className="flex justify-between items-center mt-4 p-2 bg-gray-50 rounded-lg">
            <Button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="flex items-center bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
            >
              <ChevronLeftIcon className="mr-2 h-4 w-4" /> Anterior
            </Button>
            <span className="text-sm text-gray-600">
              Página {currentPage} de {totalPages} ({filteredRecords.length} registros)
            </span>
            <Button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="flex items-center bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
            >
              Próximo <ChevronRightIcon className="ml-2 h-4 w-4" />
            </Button>
          </div>
          {selectedRecord && (
            <form onSubmit={handleSubmit} className="space-y-4 mt-6">
              {ENTITY_SCHEMAS[selectedEntity].map((column) => (
                <div key={`${selectedEntity}-${column}`} className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    {column}
                  </label>
                  <Input
                    type="text"
                    value={formData[column] || ""}
                    onChange={(e) => handleInputChange(column, e.target.value)}
                    disabled={column === '_id'} // Disable _id
                    className="w-full"
                  />
                </div>
              ))}
              <Button 
                type="submit"
                className="w-full bg-gradient-to-r from-blue-700 to-purple-700 text-white hover:from-blue-800 hover:to-purple-800"
              >
                Atualizar Registro
              </Button>
            </form>
          )}
        </>
      )}
    </div>
  )
}

export default UpdateData