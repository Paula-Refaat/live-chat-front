import React, { useEffect, useRef, useState, createRef } from "react";
import { useHistory } from "react-router-dom";
import Video from "../../components/Video";
import RoomService from "./RoomService";
import {
  muteOrUnmuteAudio,
  playOrStopVideo,
  sendMessage,
  shareScreen,
} from "./RoomUtils";
import "./RoomScreen.css";

const RoomScreen = (props) => {
  const [peers, setPeers] = useState([]); // state for rendering and also have stream of peers
  const socketRef = useRef(); // own socket
  const userVideoRef = useRef(); // for display own video
  const messageRef = createRef(); // message input
  const peersRef = useRef([]); // collection of peers who are currently connect to a room
  const screenCaptureStream = useRef(); // screen capture stream
  const roomId = props.match.params.roomId; // joined room id
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [webcamStream, setWebCamStream] = useState(null); // own webcam stream
  const [messages, setMessages] = useState([]); // all messages state after joining the room
  const history = useHistory();

  useEffect(() => {
    RoomService.connectToSocketAndWebcamStream().then(({ socket, webcamStream }) => {
      socketRef.current = socket;
      setWebCamStream(webcamStream);
      userVideoRef.current.srcObject = webcamStream;

      RoomService.setupSocketListeners(
        socketRef.current,
        webcamStream,
        setPeers,
        screenCaptureStream.current,
        peersRef.current,
        setMessages,
        roomId
      );
    });

    return async () => {
      socketRef.current.disconnect();
      await stopAllVideoAudioMedia();
    };
    //eslint-disable-next-line
  }, []);

  const stopAllVideoAudioMedia = async () => {
    const previousScreenCaptureStream = screenCaptureStream.current;
    if (previousScreenCaptureStream) {
      const previousScreenCaptureStreamTracks =
        previousScreenCaptureStream.getTracks();
      previousScreenCaptureStreamTracks.forEach((track) => {
        track.stop();
      });
    }

    const previousWebcamStream = webcamStream;
    if (previousWebcamStream) {
      const previousWebcamStreamTracks = previousWebcamStream.getTracks();
      previousWebcamStreamTracks.forEach((track) => {
        track.stop();
      });
    }
  };

  const handleOnClickAudioToggle = () => {
    muteOrUnmuteAudio(webcamStream, isAudioMuted, setIsAudioMuted);
  };

  const handlePlayOrStopVideo = () => {
    playOrStopVideo(webcamStream, isVideoMuted, setIsVideoMuted);
  };

  const handleShareScreen = async () => {
    await shareScreen(
      peers,
      screenCaptureStream,
      webcamStream,
      peers,
      userVideoRef.current,
      setIsAudioMuted,
      setIsVideoMuted
    );
  };

  const handleSendMessage = (e) => {
    sendMessage(e, socketRef.current, roomId, messageRef.current);
  };

  const leaveMeeting = () => {
    history.push("/");
  };

  return (
    <div className="room row">
      <div className="videos col s10 p0">
        <div className="videos__users-video">
          <div id="video-grid">
            <video muted ref={userVideoRef} autoPlay playsInline />
            {console.log("peers", peers)}
            {peers.map((peer) => (
              <Video controls key={peer.peerId} peer={peer} />
            ))}
          </div>
        </div>

        <div className="videos__controls">
          <div className="control">
            <div
              onClick={handleOnClickAudioToggle}
              className="control__btn-container"
            >
              {isAudioMuted ? (
                <i className="unmute fas fa-microphone-slash" />
              ) : (
                <i className="fas fa-microphone" />
              )}
              {isAudioMuted ? <span>Unmute</span> : <span>Mute</span>}
            </div>
            <div
              onClick={handlePlayOrStopVideo}
              className="control__btn-container"
            >
              {isVideoMuted ? (
                <i className="stop fas fa-video-slash" />
              ) : (
                <i className="fas fa-video" />
              )}
              {isVideoMuted ? <span>Play Video</span> : <span>Stop Video</span>}
            </div>
          </div>
          <div onClick={handleShareScreen} className="control">
            <div className="control__btn-container">
              <i className="fas fa-shield-alt" />
              <span>Share Screen</span>
            </div>
          </div>
          <div onClick={leaveMeeting} className="control">
            <div className="control__btn-container">
              <span className="leave_meeting">Leave Meeting</span>
            </div>
          </div>
        </div>
      </div>

      <div className="chat col s2 p0">
        <div className="chat__header">
          <h6>Chat</h6>
        </div>
        <div className="chat__msg-container">
          <ul className="messages">
            {messages.map((message, index) => (
              <p key={index}>
                {message.username}:{message.message}
              </p>
            ))}
          </ul>
        </div>
        <form onSubmit={handleSendMessage} className="chat__msg-send-container">
          <input
            ref={messageRef}
            type="text"
            placeholder="Enter your message here"
          />
          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  );
};

export default RoomScreen;
