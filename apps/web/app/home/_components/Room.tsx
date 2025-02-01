"use client";
import { useEffect, useRef, useState } from "react";
import { VideoContainer } from "./VideoContainer";
import { getUser } from "@/hooks/getUser";

const Room = () => {
    const user = getUser();
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const sendingPc = useRef<RTCPeerConnection | null>(null);
    const receivingPc = useRef<RTCPeerConnection | null>(null);
    const pendingCandidates = useRef<RTCIceCandidateInit[]>([]); // Store ICE candidates temporarily
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);

    const getCam = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: { width: 1280, height: 720, frameRate: 30 }
            });
            setLocalStream(stream);
            return stream;
        } catch (error) {
            console.error("Failed to get LocalStream", error);
            return null;
        }
    };

    useEffect(() => {
        const newSocket = new WebSocket("ws://localhost:8080");
    
        newSocket.onopen = () => {
            console.log("Connected to server");
            newSocket.send(
                JSON.stringify({
                    type: "add-user",
                    userId: user?.id,
                })
            );
        };
    
        newSocket.onmessage = async (event) => {
            const data = JSON.parse(event.data.toString());
            console.log("Data received: ", data);
            switch (data.type) {
                case "ice-candidate":
                    if (sendingPc.current) {
                        console.log("Adding ICE candidate to sendingPc");
                        await sendingPc.current.addIceCandidate(data.candidate);
                    } else if (receivingPc.current) {
                        console.log("Adding ICE candidate to receivingPc");
                        await receivingPc.current.addIceCandidate(data.candidate);
                    } else {
                        console.log("Peer connection not found, storing candidate.");
                        pendingCandidates.current.push(data.candidate);
                    }
                    break;
                
                case "added-user":
                    console.log("Added user");
                    break;
                case "send-offer":
                    const pc = new RTCPeerConnection({
                        iceServers: [
                            {
                                urls: [
                                    "stun:stun.l.google.com:19302",
                                    "stun:stun1.l.google.com:19302",
                                    "stun:stun2.l.google.com:19302"
                                ]
                                
                            },
                        ],
                    });
                    sendingPc.current = pc;
                    const stream = await getCam();
                    if (!stream) {
                        console.log("StreamCouldnotstart at send-offer");
                        return;
                    }
                    stream.getTracks().forEach((track) => pc.addTrack(track, stream));
                    pc.ontrack = (event) => {
                        setRemoteStream(event.streams[0]);
                    };
                    pc.onnegotiationneeded = async () => {
                        const offer = await pc.createOffer();
                        await pc.setLocalDescription(new RTCSessionDescription(offer));
                        newSocket.send(
                            JSON.stringify({
                                type: "offer",
                                sdp: offer,
                                roomId: data.roomId,
                                senderId: user?.id,
                            })
                        );
                        console.log("Offer sent from: ", user?.id);
                    };
                    pc.onicecandidate = (event) => {
                        if (event.candidate) {
                            console.log("Ice candidate sent");
                            newSocket.send(
                                JSON.stringify({
                                    type: "ice-candidate",
                                    candidate: event.candidate,
                                    roomId: data.roomId,
                                    senderId: user?.id,
                                })
                            );
                        }
                    };
                    break;
                case "offer":
                    const pc1 = new RTCPeerConnection({
                        iceServers: [
                            {
                                urls: [
                                    "stun:stun.l.google.com:19302",
                                    "stun:stun1.l.google.com:19302",
                                    "stun:stun2.l.google.com:19302"
                                ]
                                
                            },
                        ],
                    });
                    receivingPc.current = pc1;
                    const streamOffer = await getCam();
                    if (!streamOffer) {
                        console.log("StreamCouldnotstart at offer");
                        return;
                    }
                    streamOffer.getTracks().forEach((track) => pc1.addTrack(track, streamOffer));
                    await pc1.setRemoteDescription(new RTCSessionDescription(data.sdp));
                    const answer = await pc1.createAnswer();
                    await pc1.setLocalDescription(answer);
                    pc1.onicecandidate = (event) => {
                        if (event.candidate) {
                            newSocket.send(
                                JSON.stringify({
                                    type: "ice-candidate",
                                    candidate: event.candidate,
                                    roomId: data.roomId,
                                    senderId: user?.id,
                                })
                            );
                        }
                        console.log("Ice candidate sent");
                    };
                    pc1.ontrack = (event) => {
                        setRemoteStream(event.streams[0]);
                    };
                    newSocket.send(
                        JSON.stringify({
                            type: "answer",
                            sdp: answer.sdp,
                            roomId: data.roomId,
                            senderId: user?.id,
                        })
                    );
                    console.log("Answer sent by: ", user?.id );
                    break;
                case "answer":
                    console.log("Answer received: ",user?.id);
                        if (sendingPc.current) await sendingPc.current.setRemoteDescription(new RTCSessionDescription(data.sdp));
                    break;
                default:
                    break;
            }
        };
    
        newSocket.onclose = () => {
            console.log("Socket closed");
            newSocket.send(
                JSON.stringify({
                    type: "remove-user",
                    senderId: user?.id,
                })
            );
        };
    
        setSocket(newSocket);
    
        return () => {
            if (newSocket.readyState === WebSocket.OPEN) {
                newSocket.send(
                    JSON.stringify({
                        type: "remove-user"
                    })
                );
            }
            newSocket.close();
        };
    }, []);
    
    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <VideoContainer stream={remoteStream} isLocal={false} />
            <VideoContainer stream={localStream} isLocal={true} />
        </div>
    );
};

export default Room;