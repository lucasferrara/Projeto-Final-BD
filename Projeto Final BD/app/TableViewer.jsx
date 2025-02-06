'use client'
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { TableIcon, ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon, ChevronDownIcon, SearchIcon } from "lucide-react"
import { toast } from "sonner"
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

const TableViewer = () => {
  const [mounted, setMounted] = useState(false)
  const [tables, setTables] = useState([])
  const [tableCounts, setTableCounts] = useState({})
  const [selectedTable, setSelectedTable] = useState("")
  const [tableData, setTableData] = useState([])
  const [columns, setColumns] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [searchColumn, setSearchColumn] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortConfig, setSortConfig] = useState({ column: "", direction: "" })
  const recordsPerPage = 10

  useEffect(() => {
    setMounted(true)
    fetchTables()
  }, [])

  const fetchTables = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/tables")
      const data = await response.json()
      setTables(data)
      
      // Fetch count for each table
      const counts = {}
      for (const table of data) {
        const countResponse = await fetch(`http://127.0.0.1:5000/table/${table.name}/count`)
        const countData = await countResponse.json()
        counts[table.name] = countData.count
      }
      setTableCounts(counts)
    } catch (error) {
      console.error("Error fetching tables:", error)
      toast.error("Erro ao carregar tabelas")
    }
  }

  const fetchTableData = async (tableName) => {
    const loadingToast = toast.loading('Carregando dados...')
    
    try {
      const response = await fetch(`http://127.0.0.1:5000/table/${tableName}`)
      const data = await response.json()
      
      if (data && data.rows && data.columns) {
        setTableData(data.rows.filter(row => Object.keys(row).length > 0))
        setColumns(data.columns)
        toast.dismiss(loadingToast)
      } else {
        throw new Error('Dados inválidos recebidos do servidor')
      }
    } catch (error) {
      toast.dismiss(loadingToast)
      toast.error('Erro ao carregar dados da tabela', {
        description: error.message,
        duration: 4000,
      })
      console.error("Error fetching table data:", error)
    }
  }

  const handleTableSelect = (tableName) => {
    setSelectedTable(tableName)
    setCurrentPage(1) // Reset to first page
    setTableData([]) // Clear previous data
    fetchTableData(tableName)
  }

  // Filter and sort records
  const filteredAndSortedData = tableData
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
  const currentRecords = filteredAndSortedData.slice(indexOfFirstRecord, indexOfLastRecord)
  const totalPages = Math.max(1, Math.ceil(filteredAndSortedData.length / recordsPerPage))

  const formatCellValue = (value, column) => {
    if (value === null || value === undefined) return ''
    return value
  }

  if (!mounted) {
    return null // or a loading skeleton
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6 bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent">
        Visualização de Dados
      </h1>
      
      <h2 className="text-lg font-medium text-gray-700 mb-4">
        Selecione uma tabela
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-6">
        {tables.map((table, index) => (
          <div
            key={`table-button-${table.name}-${index}`}
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
              <span className="flex-1 text-left">
                {table.name} 
                <span className="text-gray-500 ml-1">
                  ({tableCounts[table.name]})
                </span>
              </span>
            </Button>
          </div>
        ))}
      </div>

      {selectedTable && tableData.length > 0 && (
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
                    <TableRow key={`${selectedTable}-row-${rowIndex}-${record[columns[0]]}`}>
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

          <div className="flex justify-between items-center mt-4 p-2 bg-gray-50 rounded-lg">
            <Button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="flex items-center bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
            >
              <ChevronLeftIcon className="mr-2 h-4 w-4" /> Anterior
            </Button>
            <span className="text-sm text-gray-600">
              Página {currentPage} de {totalPages} ({filteredAndSortedData.length} registros)
            </span>
            <Button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="flex items-center bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
            >
              Próximo <ChevronRightIcon className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

export default TableViewer