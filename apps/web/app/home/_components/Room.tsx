"use client";
import { useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";
import { VideoContainer } from "./VideoContainer";

const Room = () => {
    const [socket, setSocket] = useState<ReturnType<typeof io> | null>(null);
    const [sendingPc, setSendingPc] = useState<RTCPeerConnection | null>(null);
    const [receivingPc, setReceivingPc] = useState<RTCPeerConnection | null>(null);
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
        const newSocket = io("http://localhost:8080");
        newSocket.on("connect", () => {
            console.log("Connected to server");
        });
        setSocket(newSocket);

        newSocket.on("send-offer", async ({ roomId }: { roomId: string }) => {
            console.log("Sending offer");
            const pc = new RTCPeerConnection();
            const stream = await getCam();

            if (stream) {
                stream.getTracks().forEach((track) => pc.addTrack(track, stream));
            }
            pc.ontrack = (event) => {
                setRemoteStream(event.streams[0]);
            }
            pc.onnegotiationneeded = async () => {
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                newSocket.emit("offer", { sdp: offer.sdp, roomId, senderSocketid: newSocket.id });
            }

            pc.onicecandidate = (event) => {
                if (event.candidate) {
                    newSocket.emit("candidate", { candidate: event.candidate, roomId, senderSocketid: newSocket.id });
                }
            };

            setSendingPc(pc);
        });

        newSocket.on("offer", async ({ roomId, sdp }: { roomId: string; sdp: string }) => {
            console.log("Offer received");
            const pc = new RTCPeerConnection();
            const stream = await getCam();

            if (stream) {
                stream.getTracks().forEach((track) => pc.addTrack(track, stream));
            }

            await pc.setRemoteDescription(new RTCSessionDescription({ type: "offer", sdp }));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            pc.onicecandidate = (event) => {
                if (event.candidate) {
                    newSocket.emit("candidate", { candidate: event.candidate, roomId, senderSocketid: newSocket.id });
                }
            };

            pc.ontrack = (event) => {
                setRemoteStream(event.streams[0]);
            };

            newSocket.emit("answer", { sdp: answer.sdp, roomId, senderSocketid: newSocket.id });
            setReceivingPc(pc);
        });

        newSocket.on("answer", async ({ roomId, sdp }: { roomId: string; sdp: string }) => {
            if (sendingPc) {
                await sendingPc.setRemoteDescription(new RTCSessionDescription({ type: "answer", sdp }));
            }
            console.log("Answer received");
        });

        newSocket.on("candidate", async ({ candidate }: { candidate: RTCIceCandidateInit }) => {
            if (sendingPc) {
                await sendingPc.addIceCandidate(new RTCIceCandidate(candidate));
            }
            if (receivingPc) {
                await receivingPc.addIceCandidate(new RTCIceCandidate(candidate));
            }
            console.log("Candidate received");
        });

        return () => {
            newSocket.disconnect();
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