'use client'
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { TableIcon, ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon, ChevronDownIcon, SearchIcon } from "lucide-react"
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

const UpdateData = () => {
  const [tables, setTables] = useState([])
  const [selectedTable, setSelectedTable] = useState("")
  const [records, setRecords] = useState([])
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [formData, setFormData] = useState({})
  const [columns, setColumns] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const recordsPerPage = 5 
  const [searchColumn, setSearchColumn] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortConfig, setSortConfig] = useState({ column: "", direction: "" })

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

  const fetchTableData = async (tableName) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/table/${tableName}`)
      const data = await response.json()
      setRecords(data.rows)
      setColumns(data.columns)
    } catch (error) {
      console.error("Error fetching table data:", error)
    }
  }

  const handleTableSelect = (tableName) => {
    setSelectedTable(tableName)
    setSelectedRecord(null)
    setFormData({})
    fetchTableData(tableName)
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
    
    // Show loading toast
    const loadingToast = toast.loading('Atualizando registro...')
    
    try {
      const primaryKey = columns[0]
      const recordId = selectedRecord[primaryKey]
      
      const response = await fetch(`http://127.0.0.1:5000/table/${selectedTable}/update/${recordId}`, {
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

      // Dismiss loading toast and show success
      toast.dismiss(loadingToast)
      toast.success('Registro atualizado com sucesso!', {
        duration: 3000,
        position: 'top-center',
      })
      
      fetchTableData(selectedTable)
      setSelectedRecord(null)
      setFormData({})
    } catch (error) {
      // Dismiss loading toast and show error
      toast.dismiss(loadingToast)
      toast.error(`Erro ao atualizar: ${error.message}`, {
        duration: 4000,
        position: 'top-center',
      })
      console.error("Error updating data:", error)
    }
  }

  // Filter and sort records
  const filteredAndSortedRecords = records
    .filter(record => {
      if (!searchQuery || !searchColumn) return true
      const value = String(record[searchColumn]).toLowerCase()
      return value.includes(searchQuery.toLowerCase())
    })
    .sort((a, b) => {
      if (!sortConfig.column) return 0
      
      const aValue = a[sortConfig.column]
      const bValue = b[sortConfig.column]
      
      if (aValue === bValue) return 0
      
      const direction = sortConfig.direction === "asc" ? 1 : -1
      return aValue > bValue ? direction : -direction
    })

  // Handle sort
  const handleSort = (column) => {
    setSortConfig(current => ({
      column,
      direction: 
        current.column === column && current.direction === "asc" 
          ? "desc" 
          : "asc"
    }))
  }

  // Calculate pagination with filtered records
  const indexOfLastRecord = currentPage * recordsPerPage
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage
  const currentRecords = filteredAndSortedRecords.slice(indexOfFirstRecord, indexOfLastRecord)
  const totalPages = Math.max(1, Math.ceil(filteredAndSortedRecords.length / recordsPerPage))

  const formatCellValue = (value, column) => {
    if (value === null || value === undefined) return ''
    return value
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6 max-w-4xl mx-auto">
      <Toaster 
        theme="light"
        closeButton
        richColors
      />
      
      <h1 className="text-2xl font-semibold mb-6 bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent">
        Atualização de Dados
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

      {selectedTable && records.length > 0 && (
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
                {columns.map(column => (
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
                    {columns.map((column, index) => (
                      <TableHead 
                        key={column} 
                        className={`text-white font-medium min-w-[200px] cursor-pointer select-none hover:bg-blue-600 transition-colors relative ${
                          index !== columns.length - 1 ? 'after:content-[""] after:absolute after:right-0 after:top-2 after:bottom-2 after:w-px after:bg-blue-500' : ''
                        }`}
                        onClick={() => handleSort(column)}
                      >
                        <div className="flex items-center justify-between group">
                          <div className="flex items-center gap-2">
                            {column}
                            <div className="flex flex-col">
                              <ChevronUpIcon 
                                className={`h-3 w-3 transition-opacity ${
                                  sortConfig.column === column && sortConfig.direction === "asc"
                                    ? "opacity-100"
                                    : "opacity-40 group-hover:opacity-70"
                                }`}
                              />
                              <ChevronDownIcon 
                                className={`h-3 w-3 -mt-1 transition-opacity ${
                                  sortConfig.column === column && sortConfig.direction === "desc"
                                    ? "opacity-100"
                                    : "opacity-40 group-hover:opacity-70"
                                }`}
                              />
                            </div>
                          </div>
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentRecords.map((record, rowIndex) => (
                    <TableRow 
                      key={`${selectedTable}-row-${rowIndex}-${record[columns[0]]}`}
                      onClick={() => handleRecordSelect(record)}
                      className={`cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedRecord === record ? "bg-blue-50" : ""
                      }`}
                    >
                      {columns.map((column, colIndex) => (
                        <TableCell 
                          key={`${selectedTable}-cell-${rowIndex}-${colIndex}-${record[columns[0]]}`}
                          className={`min-w-[200px] relative ${
                            colIndex !== columns.length - 1 ? 'after:content-[""] after:absolute after:right-0 after:top-2 after:bottom-2 after:w-px after:bg-gray-200' : ''
                          }`}
                        >
                          {formatCellValue(record[column], column)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-between items-center mt-4 p-2 bg-gray-50 rounded-lg">
            <Button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="flex items-center bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
            >
              <ChevronLeftIcon className="mr-2 h-4 w-4" /> Anterior
            </Button>
            <span className="text-sm text-gray-600">
              Página {currentPage} de {totalPages} ({filteredAndSortedRecords.length} registros)
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
              {columns.map((column) => (
                <div key={`${selectedTable}-${column}`} className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    {column}
                  </label>
                  <Input
                    type="text"
                    value={formData[column] || ""}
                    onChange={(e) => handleInputChange(column, e.target.value)}
                    disabled={column === columns[0]} // Disable primary key
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