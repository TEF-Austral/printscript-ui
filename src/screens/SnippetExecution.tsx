import {Bòx} from "../components/snippet-table/SnippetBox.tsx";
import Editor from "react-simple-code-editor";
import {highlight, languages} from "prismjs";
import {OutlinedInput} from "@mui/material";
import {useEffect, useState} from "react";
import {VITE_DOMAIN} from "../utils/constants.ts";
import { useAuth0 } from "@auth0/auth0-react";

interface WebSocketMessage {
    type: 'Output' | 'InputRequest' | 'ExecutionFinished' | 'Error';
    value?: string;
    prompt?: string;
}

interface SnippetExecutionProps {
    snippetId: string;
}

export const SnippetExecution = ({ snippetId }: SnippetExecutionProps) => {
    const [input, setInput] = useState<string>("");
    const [output, setOutput] = useState<string[]>([]);
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [isRunning, setIsRunning] = useState<boolean>(false);
    const [isAwaitingInput, setIsAwaitingInput] = useState<boolean>(false);
    const { getAccessTokenSilently } = useAuth0();

    useEffect(() => {
        const connect = async () => {
            try {
                const token = await getAccessTokenSilently();
                const wsUrl = `wss://${VITE_DOMAIN}/api/snippet/ws/execute-interactive?snippetId=${snippetId}&token=${token}`;

                const ws = new WebSocket(wsUrl);

                ws.onopen = () => {
                    console.log("WebSocket conectado");
                    setSocket(ws);
                    setIsRunning(true);
                    setOutput(prev => [...prev, "Conectado al servidor..."]);
                };

                ws.onclose = () => {
                    console.log("WebSocket desconectado");
                    setSocket(null);
                    setIsRunning(false);
                    setIsAwaitingInput(false);
                    setOutput(prev => [...prev, "Desconectado del servidor."]);
                };

                ws.onerror = (err) => {
                    console.error("Error de WebSocket:", err);
                    setOutput(prev => [...prev, "Error de conexión."]);
                };

                ws.onmessage = (event) => {
                    const msg: WebSocketMessage = JSON.parse(event.data);
                    switch (msg.type) {
                        case 'Output':
                            setOutput(prev => [...prev, msg.value ?? '']);
                            break;
                        case 'InputRequest':
                            setOutput(prev => [...prev, msg.prompt ?? 'Esperando entrada...']);
                            setIsAwaitingInput(true);
                            break;
                        case 'ExecutionFinished':
                            setOutput(prev => [...prev, "Ejecución finalizada."]);
                            ws.close();
                            break;
                        case 'Error':
                            setOutput(prev => [...prev, `ERROR: ${msg.value}`]);
                            ws.close();
                            break;
                    }
                };
            } catch (e) {
                console.error("Error al obtener token para WebSocket:", e);
                setOutput(prev => [...prev, "Error de autenticación al conectar."]);
            }
        };

        connect();

        return () => {
            if (socket && socket.readyState === WebSocket.OPEN) {
                socket.close();
            }
        };
    }, [snippetId, getAccessTokenSilently]);

    const code = output.join("\n");

    const handleEnter = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' && isAwaitingInput && socket && input.trim() !== "") {
            const response = {
                type: 'InputResponse',
                value: input
            };
            socket.send(JSON.stringify(response));
            setOutput(prev => [...prev, `> ${input}`]);
            setInput("");
            setIsAwaitingInput(false);
        }
    };

    return (
        <>
            <Bòx flex={1} overflow={"auto"} minHeight={400} bgcolor={'black'} color={'white'} code={code}>
                <Editor
                    value={code}
                    padding={10}
                    onValueChange={() => {}}
                    readOnly={true}
                    highlight={(code) => highlight(code, languages.js, 'javascript')}
                    style={{
                        fontFamily: "monospace",
                        fontSize: 17,
                        minHeight: '400px'
                    }}
                />
            </Bòx>
            <OutlinedInput
                onKeyDown={handleEnter}
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={isAwaitingInput ? "Escribe tu entrada aquí..." : "La ejecución no está esperando una entrada"}
                fullWidth
                disabled={!isAwaitingInput || !isRunning}
            />
        </>
    );
};