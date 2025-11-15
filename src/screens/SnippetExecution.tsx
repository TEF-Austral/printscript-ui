import {SnippetBox} from "../components/snippet-table/SnippetBox.tsx";
import Editor from "react-simple-code-editor";
import {highlight, languages} from "prismjs";
import {Button, OutlinedInput, Stack} from "@mui/material";
import {useEffect, useRef, useState} from "react";
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
    const [executionKey, setExecutionKey] = useState<number>(0);
    const { getAccessTokenSilently } = useAuth0();
    const wsRef = useRef<WebSocket | null>(null);
    const isMountedRef = useRef(true);

    useEffect(() => {
        isMountedRef.current = true;

        const connect = async () => {
            try {
                if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                    wsRef.current.close();
                }

                const token = await getAccessTokenSilently();
                const wsUrl = `wss://${VITE_DOMAIN}/ws/execute-interactive?snippetId=${snippetId}&token=${token}`;

                const ws = new WebSocket(wsUrl);
                wsRef.current = ws;

                ws.onopen = () => {
                    if (!isMountedRef.current) {
                        ws?.close();
                        return;
                    }
                    console.log("WebSocket conectado");
                    setSocket(ws);
                    setIsRunning(true);
                };

                ws.onclose = () => {
                    if (!isMountedRef.current) return;
                    console.log("WebSocket desconectado");
                    setSocket(null);
                    setIsRunning(false);
                    setIsAwaitingInput(false);
                };

                ws.onerror = (err) => {
                    if (!isMountedRef.current) return;
                    console.error("Error de WebSocket:", err);
                    setOutput(prev => [...prev, "Error de conexión."]);
                };

                ws.onmessage = (event) => {
                    if (!isMountedRef.current) return;

                    const msg: WebSocketMessage = JSON.parse(event.data);
                    switch (msg.type) {
                        case 'Output':
                            setOutput(prev => [...prev, msg.value ?? '']);
                            break;
                        case 'InputRequest':
                            // setOutput(prev => [...prev, msg.prompt ?? 'Esperando entrada...']);
                            setIsAwaitingInput(true);
                            break;
                        case 'ExecutionFinished':
                            setOutput(prev => [...prev, "✅ Ejecución completada con éxito."]);
                            ws?.close();
                            break;
                        case 'Error':
                            setOutput(prev => [...prev, `❌ ERROR: ${msg.value}`]);
                            ws?.close();
                            break;
                    }
                };
            } catch (e) {
                if (!isMountedRef.current) return;
                console.error("Error al obtener token para WebSocket:", e);
                setOutput(prev => [...prev, "Error de autenticación al conectar."]);
            }
        };

        connect();

        return () => {
            isMountedRef.current = false;
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                wsRef.current.close();
            }
        };
    }, [snippetId, getAccessTokenSilently, executionKey]);

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

    const handleRestart = () => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.close();
        }
        setOutput([]);
        setInput("");
        setIsAwaitingInput(false);
        setIsRunning(false);
        setSocket(null);
        setExecutionKey(prev => prev + 1);
    };

    return (
        <>
            <SnippetBox flex={1} overflow={"auto"} minHeight={400} bgcolor={'black'} color={'white'} code={code}>
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
            </SnippetBox>
            <Stack direction="row" spacing={2} alignItems="center">
                <OutlinedInput
                    onKeyDown={handleEnter}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder={isAwaitingInput ? "Escribe tu entrada aquí..." : "La ejecución no está esperando una entrada"}
                    fullWidth
                    disabled={!isAwaitingInput || !isRunning}
                />
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleRestart}
                    sx={{ minWidth: '150px', whiteSpace: 'nowrap' }}
                >
                    🔄 Reiniciar
                </Button>
            </Stack>
        </>
    );
};