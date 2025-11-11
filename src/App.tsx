import './App.css';
import {RouterProvider} from "react-router";
import {createBrowserRouter} from "react-router-dom";
import HomeScreen from "./screens/Home.tsx";
import {QueryClient, QueryClientProvider} from "react-query";
import RulesScreen from "./screens/Rules.tsx";
import {withAuthenticationRequired} from "@auth0/auth0-react";
import React from "react";

const ProtectedRoute = ({ component }: { component: React.ComponentType }) => {
    const Component = withAuthenticationRequired(component);
    return <Component />;
};

const router = createBrowserRouter([
    {
        path: "/",
        element: <ProtectedRoute component={HomeScreen} />
    },
    {
        path: '/rules',
        element: <ProtectedRoute component={RulesScreen} />
    }
]);

export const queryClient = new QueryClient()
const App = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <RouterProvider router={router}/>
        </QueryClientProvider>
    );
}
export default App;
