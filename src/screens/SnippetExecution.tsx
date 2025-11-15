import {SnippetBox} from "../components/snippet-table/SnippetBox.tsx";
import Editor from "react-simple-code-editor";
import {highlight, languages} from "prismjs";
import {OutlinedInput, Box} from "@mui/material";
import {useEffect, useRef, useState, forwardRef, useImperativeHandle, useCallback} from "react";
import {VITE_DOMAIN} from "../utils/constants.ts";
import {useAuth0} from "@auth0/auth0-react";

interface WebSocketMessage {
    type: 'Output' | 'InputRequest' | 'ExecutionFinished' | 'Error';
    value?: string;
    prompt?: string;
}

interface SnippetExecutionProps {
    snippetId: string;
}

export interface SnippetExecutionHandle {
    start: () => void;
}

export const SnippetExecution = forwardRef<SnippetExecutionHandle, SnippetExecutionProps>(({snippetId}: SnippetExecutionProps, ref) => {
    const [input, setInput] = useState<string>("");
    const [output, setOutput] = useState<string[]>([]);
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [isRunning, setIsRunning] = useState<boolean>(false);
    const [isAwaitingInput, setIsAwaitingInput] = useState<boolean>(false);
    const {getAccessTokenSilently} = useAuth0();
    const wsRef = useRef<WebSocket | null>(null);
    const isMountedRef = useRef(true);

    useEffect(() => {
        isMountedRef.current = true;

        return () => {
            isMountedRef.current = false;
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                wsRef.current.close();
            }
        };
    }, []);

    const startExecution = useCallback(async () => {
        try {
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                wsRef.current.close();
            }

            setOutput([]);
            setInput("");
            setIsAwaitingInput(false);

            const token = await getAccessTokenSilently();
            const wsUrl = `wss://${VITE_DOMAIN}/ws/execute-interactive?snippetId=${snippetId}&token=${token}`;

            const ws = new WebSocket(wsUrl);
            wsRef.current = ws;

            ws.onopen = () => {
                if (!isMountedRef.current) {
                    ws?.close();
                    return;
                }
                console.log("WebSocket connected");
                setSocket(ws);
                setIsRunning(true);
            };

            ws.onclose = () => {
                if (!isMountedRef.current) return;
                console.log("WebSocket disconnected");
                setSocket(null);
                setIsRunning(false);
                setIsAwaitingInput(false);
            };

            ws.onerror = (err) => {
                if (!isMountedRef.current) return;
                console.error("WebSocket error:", err);
                setOutput(prev => [...prev, "Connection error."]);
            };

            ws.onmessage = (event) => {
                if (!isMountedRef.current) return;

                const msg: WebSocketMessage = JSON.parse(event.data);
                switch (msg.type) {
                    case 'Output':
                        setOutput(prev => [...prev, msg.value ?? '']);
                        break;
                    case 'InputRequest':
                        setIsAwaitingInput(true);
                        break;
                    case 'ExecutionFinished':
                        setOutput(prev => [...prev, "Execution completed successfully."]);
                        ws?.close();
                        break;
                    case 'Error':
                        setOutput(prev => [...prev, `ERROR: ${msg.value}`]);
                        ws?.close();
                        break;
                }
            };
        } catch (e) {
            if (!isMountedRef.current) return;
            console.error("Error obtaining token for WebSocket:", e);
            setOutput(prev => [...prev, "Authentication error while connecting."]);
        }
    }, [getAccessTokenSilently, snippetId]);


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



    useImperativeHandle(ref, () => ({
        start: () => {
            if (isRunning) return;
            startExecution();
        }
    }), [isRunning, startExecution]);

    return (
        <>
            <Box width="100%">
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
                <Box mt={2}>
                    <OutlinedInput
                        onKeyDown={handleEnter}
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder={isAwaitingInput ? "Type your input here..." : "Execution is not awaiting input"}
                        fullWidth
                        disabled={!isAwaitingInput || !isRunning}
                    />
                </Box>
            </Box>
        </>
    );
});
