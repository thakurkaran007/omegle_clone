"use client"
import { useEffect, useState } from "react";
import io, { Socket } from 'socket.io-client';
import { VideoContainer } from "./VideoContainer";

const Video = () => {
    const [socket, setSocket] = useState<null | typeof Socket>(null);
    const [connected, setConnected] = useState<boolean>(false);
    const [sendingPc, setSendingPc] = useState<RTCPeerConnection | null>(null);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

    const getCam = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: {
                    width: { min: 640, ideal: 1280, max: 1920 }, height: { min: 360, ideal: 720, max: 1080 }, frameRate: { min: 16, ideal: 30, max: 30}
                }
            });
            setLocalStream(stream);

        } catch (error) {
            console.log("Failed to get LocalStraem", error);
        }
    }

    useEffect(() => {
        const socket = io('http://localhost:8080', { autoConnect: false });

        socket.on('send-offer', async ({roomId}: {roomId: string}) => {
            const pc = new RTCPeerConnection();
            pc.onnegotiationneeded = async () => {
                const sdp = await pc.createOffer();
                socket.emit("offer", { sdp, roomId })
            }
            setSendingPc(pc);
            pc.onicecandidate = (event) => {
                if (event.candidate) {
                    socket.emit("candidate", { candidate: event.candidate, roomId })
                }
            }
        });
        socket.on('offer', async ({roomId, sdp}: {roomId: string, sdp: string}) => {
            const pc = new RTCPeerConnection();
            await pc.setRemoteDescription(new RTCSessionDescription({ type: "offer", sdp }));
            const answer = await pc.createAnswer();
            setSendingPc(pc);
            socket.emit("answer", { sdp: answer, roomId })
            pc.onicecandidate = (event) => {
                if (event.candidate) {
                    socket.emit("candidate", { candidate: event.candidate, roomId })
                }
            }
            pc.ontrack = (event) => {
                setRemoteStream(event.streams[0]);
            }
        })
        socket.on('answer', async ({roomId, answer}: {roomId: string, answer: string}) => {
            await sendingPc?.setRemoteDescription(new RTCSessionDescription({ type: "answer", sdp: answer }));
        })
    }, [socket]);

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <VideoContainer stream={remoteStream} isLocal={false}/>
            <VideoContainer stream={localStream} isLocal={true}/>
        </div>
    )
}
export default Video;