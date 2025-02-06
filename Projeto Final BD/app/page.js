import TableViewer from "./TableViewer"
import InsertData from "./InsertData"
import UpdateData from "./UpdateData"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DatabaseIcon, EyeIcon, PlusCircleIcon, RefreshCwIcon, TableIcon } from "lucide-react"

const MainPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white flex flex-col">
      <div className="max-w-5xl mx-auto w-full flex-grow px-4 py-8">
        <div className="bg-white shadow-xl rounded-xl overflow-hidden border border-emerald-100">
          <div className="bg-gradient-to-r from-blue-700 to-purple-700 text-white p-6 flex items-center space-x-4 shadow-md">
            <DatabaseIcon className="w-10 h-10 text-white" />
            <h1 className="text-3xl font-extrabold tracking-tight">Gerenciamento de Dados de Eventos</h1>
          </div>
          
          <div className="p-2 bg-gray-50">
            <Tabs defaultValue="view" className="w-full">
              <TabsList className="grid grid-cols-3 gap-2 bg-gray-100 p-1.5 rounded-lg">
                <TabsTrigger 
                  value="view" 
                  className="py-3 rounded-md text-blue-600 hover:bg-blue-50 transition-all 
                             data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800 
                             data-[state=active]:shadow-sm flex items-center justify-center"
                >
                  <EyeIcon className="mr-2 text-blue-600" /> Visualizar Dados
                </TabsTrigger>
                <TabsTrigger 
                  value="insert" 
                  className="py-3 rounded-md text-green-600 hover:bg-green-50 transition-all 
                             data-[state=active]:bg-green-100 data-[state=active]:text-green-800 
                             data-[state=active]:shadow-sm flex items-center justify-center"
                >
                  <PlusCircleIcon className="mr-2 text-green-600" /> Inserir Dados
                </TabsTrigger>
                <TabsTrigger 
                  value="update" 
                  className="py-3 rounded-md text-purple-600 hover:bg-purple-50 transition-all 
                             data-[state=active]:bg-purple-100 data-[state=active]:text-purple-800 
                             data-[state=active]:shadow-sm flex items-center justify-center"
                >
                  <RefreshCwIcon className="mr-2 text-purple-600" /> Atualizar Dados
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="view" className="p-4 bg-white rounded-b-lg shadow-inner">
                <TableViewer />
              </TabsContent>
              <TabsContent value="insert" className="p-4 bg-white rounded-b-lg shadow-inner">
                <InsertData />
              </TabsContent>
              <TabsContent value="update" className="p-4 bg-white rounded-b-lg shadow-inner">
                <UpdateData />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      <footer className="bg-white border-t p-4 text-center text-sm text-gray-600">
        <div className="max-w-4xl mx-auto flex items-center justify-center">
          <div className="mr-8">
            <img 
              src="/unifesp-logo.png" 
              alt="UNIFESP Logo" 
              className="h-12 w-auto"
            />
          </div>
          <div>
            <div>Projeto Final de Banco de Dados - Profa. Dra. Daniela Leal Musa</div>
            <div>Grupo: Lucas Ferrara, Shogo Miyazaki, Nicolas Pereira e Estevan Teixeira</div>
          </div>
        </div>
      </footer>
    </div>
  )
}
export default MainPage