"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@repo/ui/src/components/button";
import { useSession } from "next-auth/react";

type Message = {
    senderId: string;
    message: string;
}

const Room = () => {
    const session = useSession();
    const user = session.data?.user;
    const [disabled, setDisabled] = useState(true);
    const [onGoinngCall, setOnGoingCall] = useState(false);
    const socketRef = useRef<WebSocket | null>(null);
    const sendingPc = useRef<RTCPeerConnection | null>(null);
    const receivingPc = useRef<RTCPeerConnection | null>(null);
    const localRef = useRef<HTMLVideoElement | null>(null);
    const remoteRef = useRef<HTMLVideoElement | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const SendQueue = useRef<RTCIceCandidate[]>([]);
    const [message, setMessage] = useState("");
    const [allMessages, setAllMessages] = useState<Message[]>([]);
    const RecieveQueue = useRef<RTCIceCandidate[]>([]);

    useEffect(() => {
        const hasRefreshed = sessionStorage.getItem("hasRefresh");
    
        if (!hasRefreshed) {
          sessionStorage.setItem("hasRefresh", "true");
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        }
      }, []);
    useEffect(() => {
        if (!socketRef.current) return;

        const pingInterval = setInterval(() => {
            if (socketRef.current?.readyState === WebSocket.OPEN) {
                console.log("Ping");
                socketRef.current.send(JSON.stringify({ type: "ping" }));
            }
        }, 3000); // Sends a ping every 3 seconds

        return () => {
            clearInterval(pingInterval); // Cleanup the interval on component unmount
        };
    }, [socketRef.current]);

    const iceServers = [
      {
        urls: 'turn:54.210.210.51:3478',     // TURN server
        username: 'testuser',                // TURN username
        credential: 'testpass'               // TURN password
      },
      {
        urls: 'stun:stun.l.google.com:19302'  // STUN server
      }
    ];

    
    const sendMessage = useCallback(() => {
            if (!socketRef.current || !user) {
                console.log(user, socketRef.current);
                console.error("No WebSocket connection or user available");
                return;
            }
            if (!message.trim()) return;
            const newMessage: Message = { senderId: user.id ?? "", message };
            socketRef.current.send(JSON.stringify({ type: "message", senderId: user.id, message }));
            setAllMessages((prev) => [...prev, newMessage]);
            setMessage("")
    }, [socketRef.current, message]);

    const New = useCallback(() => {
        if (!socketRef.current || !user) return;
        setOnGoingCall(true);
        socketRef.current.send(JSON.stringify({ type: "add-user", userId: user.id }));
    }, [user, socketRef.current]);

    const stop = useCallback(() => {
        if (!socketRef.current || !user) {
            console.log(user, socketRef.current);
            console.error("No WebSocket connection or user available");
            return;
        }
        console.log("sendding to remove user");
        setOnGoingCall(false);
        setDisabled(true);
        setRemoteStream(null);
        sendingPc.current?.close();
        receivingPc.current?.close();
        sendingPc.current = null;
        receivingPc.current = null;
        socketRef.current.send(JSON.stringify({ type: "remove-user", isNew: true }));
       
    }, [user, socketRef.current]);

    const getCam = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
            setLocalStream(stream);
            return stream;
        } catch (error) {
            console.error("Failed to get camera access:", error);
            return null;
        }
    }, [user]);

    useEffect(() => {
        const fetchCam = async () => {
            await getCam();
        };
        fetchCam();
    }, [user]);

    useEffect(() => {
        if (socketRef.current) return;
        if (!user) return;

        try {
            const newSocket = new WebSocket("wss://backend1.thakurkaran.xyz");
            socketRef.current = newSocket;

        newSocket.onopen = () => {
            console.log("✅ Connected to WebSocket");
        };

        newSocket.onclose = () => {
            console.log("⚠️ WebSocket disconnected");
            socketRef.current = null;
        };

        newSocket.onmessage = async (event) => {
            const data = JSON.parse(event.data);

            switch (data.type) {
                case "pong":
                    console.log("ServerPong");
                    break;
                case "user-disconnected":
                    console.log("User disconnected");
                    setOnGoingCall(false);
                    setDisabled(true);
                    setRemoteStream(null);
                    sendingPc.current?.close();
                    receivingPc.current?.close();
                    sendingPc.current = null;
                    receivingPc.current = null;
                    setTimeout(() => console.log("Waiting for 2 seconds: "), 1000);
                    newSocket.send(JSON.stringify({type: "add-user", userId: user.id}));
                    break;
                case "send-offer":
                    sendingPc.current = new RTCPeerConnection({
                        iceServers: iceServers
                    });

                    const stream = await getCam();
                    if (!stream) return;
                    stream.getTracks().forEach(track => sendingPc.current!.addTrack(track, stream));

                    sendingPc.current!.onicecandidate = (event) => {
                        if (event.candidate) {
                            console.log("Sending ICE candidate from sendingPc");
                            newSocket.send(JSON.stringify({
                                type: "ice-candidate",
                                candidate: event.candidate,
                                roomId: data.roomId,
                                senderId: user?.id
                            }));
                        }
                    };

                    sendingPc.current!.onnegotiationneeded = async () => {
                        if (!sendingPc.current) return;
                        const offer = await sendingPc.current.createOffer();
                        await sendingPc.current.setLocalDescription(offer);
                        console.log("Sending offer");
                        newSocket.send(JSON.stringify({
                            type: "offer",
                            sdp: offer.sdp,
                            roomId: data.roomId,
                            senderId: user?.id
                        }));
                    };
                    break;

                case "offer":
                    receivingPc.current = new RTCPeerConnection({
                        iceServers: iceServers
                    });

                    receivingPc.current!.ontrack = (event) => {
                        console.log("📡 Received remote stream");
                        setRemoteStream(event.streams[0]);
                        setDisabled(false);
                    };

                    receivingPc.current!.onicecandidate = (event) => {
                        if (event.candidate) {
                            console.log("Sending ICE candidate from receivingPc");
                            newSocket.send(JSON.stringify({
                                type: "ice-candidate",
                                candidate: event.candidate,
                                roomId: data.roomId,
                                senderId: user?.id
                            }));
                        }
                    };

                    await receivingPc.current!.setRemoteDescription(new RTCSessionDescription({ type: "offer", sdp: data.sdp }));
                    const answer = await receivingPc.current!.createAnswer();
                    await receivingPc.current!.setLocalDescription(answer);

                    newSocket.send(JSON.stringify({
                        type: "answer",
                        sdp: answer.sdp,
                        roomId: data.roomId,
                        senderId: user?.id
                    }));

                    // Process queued ICE candidates
                    while (RecieveQueue.current.length > 0) {
                        console.log("Processing queued ICE candidate");
                        await receivingPc.current!.addIceCandidate(RecieveQueue.current.shift()!);
                    }
                    break;

                case "answer":
                    if (sendingPc.current) {
                        console.log("Setting answer on SendingPc");
                        await sendingPc.current.setRemoteDescription(new RTCSessionDescription({ type: "answer", sdp: data.sdp }));
                        while (SendQueue.current.length > 0) {
                            console.log("Applying queued ICE candidate to sendingPc");
                            await sendingPc.current.addIceCandidate(SendQueue.current.shift()!);
                        }
                    } else {
                        console.error("No sendingPc available to set answer");
                    }
                    break;

                case "ice-candidate":
                    try {
                        const candidate = new RTCIceCandidate(data.candidate);
                        if (sendingPc.current) {
                            if (sendingPc.current.remoteDescription) {
                                console.log("🧊 Adding ICE candidate for SendingPc");
                                await sendingPc.current.addIceCandidate(candidate);
                            } else {
                                console.log("Queueing ICE candidate");
                                SendQueue.current.push(candidate);
                            }
                        } else if (receivingPc.current) {
                                if (receivingPc.current.remoteDescription) {
                                console.log("🧊 Adding ICE candidate for ReceivingPc");
                                await receivingPc.current.addIceCandidate(candidate);
                                } else {
                                console.log("Queueing ICE candidate");
                                RecieveQueue.current.push(candidate);
                            }
                        }
                    } catch (error) {
                        console.error("❌ Error adding ICE candidate:", error);
                    }
                    break;
                case "message":
                    setAllMessages((prev) => [...prev, data.message]);
                    break;
                default:
                    console.error("❓ Unknown message type:", data.type);
                    break;
            }
            return () => {
                console.log("🧹 Cleaning up WebSocket connection");
                newSocket.close();
                socketRef.current = null;
            };
        };
        } catch (error) {
            console.log("Error in sokcet: ", error)
        }

    }, [user]);

    useEffect(() => {
        if (localStream && localRef.current) {
            localRef.current.srcObject = localStream;
        }
        if (remoteStream && remoteRef.current) {
            remoteRef.current.srcObject = remoteStream;
        }
    }, [localStream, remoteStream]);

    useEffect(() => {
        return () => {
            console.log("🧹 Cleaning up Peer Connections");
            sendingPc.current?.close();
            receivingPc.current?.close();
        };
    }, []);

    if (!user) return;

    return (
        <div className="grid grid-cols-[25%_75%] h-full" >
            
            <div className="flex flex-col items-center justify-around h-full p-7 bg-[#f8f6f3]">
                <video ref={remoteRef} autoPlay playsInline muted={false} className=" rounded" />
                <video ref={localRef} autoPlay playsInline muted className=" rounded mt-4" />
            </div>
            <div className="h-[80vh] w-full flex flex-col relative overflow-auto p-4">
                <div className="flex-grow space-y-3 overflow-auto">
                    {allMessages.length > 0 && user.id ? (
                        allMessages.map((msg, index) => (
                            <div key={index} className={`flex ${msg.senderId === user.id ? "justify-end" : "justify-start"}`}>
                                <div className={`px-3 py-2 rounded-lg text-sm max-w-[60%] text-white shadow-md ${msg.senderId === user.id ? "bg-blue-500" : "bg-gray-600"}`}>
                                    <span>{msg.message}</span>
                                </div>
                            </div>
                        ))
                    ) : ( !onGoinngCall ? (
                        <div className="text-gray-500">
                            <div>Ready to chat with new friends worldwide? Start matching for an enjoyable and fun communication experience! 🌍</div>
                            <div>🔥🔥🔥</div>
                            <Button onClick={() => New()} className="w-20 p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600" >Start</Button>
                        </div>
                    ) : ( !disabled ? (
                        <div className="text-gray-500">
                            <div>Connected! Start chatting now! 🎉</div>
                        </div>
                    ) : (
                        <div className="text-gray-500">
                            <div>Waiting for the other user to connect...</div>
                        </div>
                    )
                    )
                    )}
                </div>
                <div className="flex items-center gap-x-2 p-2 border-t border-gray-300 bg-white rounded-md shadow-md">
                    <Button className="flex-grow ml-2 p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600" disabled={(onGoinngCall ? disabled : false)} onClick={onGoinngCall ? stop : New}>{onGoinngCall ? "Stop" : "New"}</Button>
                    <input 
                        type="text" 
                        value={message} 
                        onChange={(e) => setMessage(e.target.value)}
                        className="flex-1 p-2 border rounded-md outline-none text-sm" 
                        placeholder="Type a message..."
                        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    />
                    <Button onClick={() => sendMessage()} className="ml-2 p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600" disabled={onGoinngCall ? disabled : false}>Send</Button>
                </div>
            </div>
        </div>
    );
};

export default Room;
