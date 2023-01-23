import { ReactElement, createElement, useEffect } from "react";

import { Camera } from "@mediapipe/camera_utils";
import { Hands, HAND_CONNECTIONS } from "@mediapipe/hands";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";

export default function HandTracking(): ReactElement {
    useEffect(() => {
        const videoElement = document.getElementsByClassName("input_video")[0] as HTMLVideoElement;
        const canvasElement = document.getElementsByClassName("output_canvas")[0] as HTMLCanvasElement;
        const canvasCtx = canvasElement.getContext("2d");

        function onResults(results: { image: CanvasImageSource; multiHandLandmarks: any }): void {
            if (!canvasCtx) {
                return;
            }

            canvasCtx.save();
            canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
            canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
            if (results.multiHandLandmarks) {
                for (const landmarks of results.multiHandLandmarks) {
                    drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, { color: "#00FF00", lineWidth: 5 });
                    drawLandmarks(canvasCtx, landmarks, { color: "#FF0000", lineWidth: 2 });
                }
            }
            canvasCtx.restore();
        }

        const hands = new Hands({
            locateFile: file => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
            }
        });
        hands.setOptions({
            maxNumHands: 2,
            modelComplexity: 1,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });
        hands.onResults(onResults);

        const camera = new Camera(videoElement, {
            onFrame: async () => {
                await hands.send({ image: videoElement });
            },
            width: 1280,
            height: 720
        });
        camera.start();
    }, []);

    return (
        <div className="container">
            <video className="input_video"></video>
            <canvas className="output_canvas" width="1280px" height="720px"></canvas>
        </div>
    );
}