"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getUser } from "@/hooks/getUser";

const Room = () => {
    const user = getUser();
    const socketRef = useRef<WebSocket | null>(null);
    const sendingPc = useRef<RTCPeerConnection | null>(null);
    const receivingPc = useRef<RTCPeerConnection | null>(null);
    const localRef = useRef<HTMLVideoElement | null>(null);
    const remoteRef = useRef<HTMLVideoElement | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const SendQueue = useRef<RTCIceCandidate[]>([]);
    const RecieveQueue = useRef<RTCIceCandidate[]>([]);


    const getCam = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
            setLocalStream(stream);
            return stream;
        } catch (error) {
            console.error("Failed to get camera access:", error);
            return null;
        }
    }, []);

    useEffect(() => {
        const fetchCam = async () => {
            await getCam();
        };
        fetchCam();
    }, []);

    useEffect(() => {
        if (socketRef.current) return; // Prevent duplicate WebSocket connections

        const newSocket = new WebSocket("ws://localhost:8080");
        socketRef.current = newSocket;

        newSocket.onopen = () => {
            console.log("✅ Connected to WebSocket");
            newSocket.send(JSON.stringify({ type: "add-user", userId: user?.id }));
        };

        newSocket.onclose = () => {
            console.log("⚠️ WebSocket disconnected");
            socketRef.current = null;
        };

        newSocket.onmessage = async (event) => {
            const data = JSON.parse(event.data);
            console.log("📩 Received: ", data);

            switch (data.type) {
                case "send-offer":
                    sendingPc.current = new RTCPeerConnection({
                        iceServers: [{ urls: [
                            "stun:stun.l.google.com:19302",
                            "stun:stun1.l.google.com:19302",
                            "stun:stun2.l.google.com:19302",
                            "stun:stun3.l.google.com:19302",
                            "stun:stun4.l.google.com:19302"
                        ] }],
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
                        iceServers: [{ urls: [
                            "stun:stun.l.google.com:19302",
                            "stun:stun1.l.google.com:19302",
                            "stun:stun2.l.google.com:19302",
                            "stun:stun3.l.google.com:19302",
                            "stun:stun4.l.google.com:19302"
                        ] }],
                    });

                    receivingPc.current!.ontrack = (event) => {
                        console.log("📡 Received remote stream");
                        setRemoteStream(event.streams[0]);
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

                default:
                    console.error("❓ Unknown message type:", data.type);
                    break;
            }
        };

        return () => {
            console.log("🧹 Cleaning up WebSocket connection");
            newSocket.close();
            socketRef.current = null;
        };
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

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <video ref={remoteRef} autoPlay playsInline muted={false} className="w-1/2 border border-gray-400 rounded"></video>
            <video ref={localRef} autoPlay playsInline muted className="w-1/4 border border-gray-400 rounded mt-4"></video>
        </div>
    );
};

export default Room;