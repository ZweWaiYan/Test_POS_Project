import Register from "./Login/Register";
import Login from "./Login/Login"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import MainRoute from "./MainRoute";


const queryClient = new QueryClient();

function App() {

  return (
    <QueryClientProvider client={queryClient}>      
      <MainRoute />      
    </QueryClientProvider>

  )
}

export default App