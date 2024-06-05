// Removed unused import 'Peer'
import io from "socket.io-client";
import { addPeer, createPeer } from "./RoomUtils";

// const BASE_URL = process.env.REACT_APP_BASE_URL;
const BASE_URL = "https://live-chat-backend-35d9.onrender.com";

const RoomService = {
  connectToSocketAndWebcamStream: async () => {
    const socket = io.connect(BASE_URL);

    const webcamStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    return { socket, webcamStream };
  },

  setupSocketListeners: (
    socket,
    webcamStream,
    setPeers,
    screenCaptureStream,
    currentPeers,
    setMessages,
    roomId
  ) => {
    socket.emit("joinRoom", roomId); // sending to the server that a user joined to a room

    socket.on("usersInRoom", (users) => {
      const tempPeers = [];
      console.log("usersInRoom", users, webcamStream);
      users.forEach((otherUserSocketId) => {
        const peer = createPeer(
          otherUserSocketId,
          socket.id,
          webcamStream,
          socket
        );
        currentPeers.push({
          peerId: otherUserSocketId,
          peer,
        });
        tempPeers.push({
          peerId: otherUserSocketId,
          peer,
        });
      });
      setPeers(tempPeers);
    });

    socket.on("userJoined", (payload) => {
      let peer;
      if (screenCaptureStream)
        peer = addPeer(
          payload.signal,
          payload.callerId,
          screenCaptureStream,
          socket
        );
      else
        peer = addPeer(payload.signal, payload.callerId, webcamStream, socket);
      currentPeers.push({
        peerId: payload.callerId,
        peer,
      });
      const peerObj = {
        peer,
        peerId: payload.callerId,
      };

      setPeers((users) => [...users, peerObj]);
    });

    socket.on("takingReturnedSignal", (payload) => {
      const item = currentPeers.find((p) => p.peerId === payload.id);
      item.peer.signal(payload.signal);
    });

    socket.on("receiveMessage", (payload) => {
      setMessages((messages) => [...messages, payload]);
    });

    socket.on("userLeft", (id) => {
      const peerObj = currentPeers.find((p) => p.peerId === id);
      if (peerObj?.peer) peerObj.peer.destroy();
      const peers = currentPeers.filter((p) => p.peerId !== id);
      currentPeers = peers;
      setPeers(peers);
    });

    socket.on("disconnect", (payload) => {
      const previousWebcamStream = webcamStream;
      const previousWebcamStreamTracks = previousWebcamStream.getTracks();
      previousWebcamStreamTracks.forEach((track) => {
        track.stop();
      });

      const previousScreenCaptureStream = screenCaptureStream;
      if (previousScreenCaptureStream) {
        const previousScreenCaptureStreamTracks =
          previousScreenCaptureStream.getTracks();
        previousScreenCaptureStreamTracks.forEach((track) => {
          track.stop();
        });
      }
    });
  },
};

export default RoomService;
