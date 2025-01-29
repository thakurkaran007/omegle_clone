"use client";

import { useEffect, useRef } from "react";

interface VideoContainerProps {
    stream: MediaStream | null;
    isLocal: boolean;
}

export const VideoContainer = ({ stream, isLocal }: VideoContainerProps) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    return (
        <video autoPlay playsInline muted={isLocal}></video>
    )
}