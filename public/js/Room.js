'use strict';

if (location.href.substr(0, 5) !== 'https') location.href = 'https' + location.href.substr(4, location.href.length - 4);

/**
 * MiroTalk SFU - Room component
 *
 * @link    GitHub: https://github.com/miroslavpejic85/mirotalksfu
 * @link    Live demo: https://sfu.mirotalk.com
 * @license For open source use: AGPLv3
 * @license For commercial or closed source, contact us at info.mirotalk@gmail.com
 * @author  Miroslav Pejic - miroslav.pejic.85@gmail.com
 * @version 1.0.0
 */

// ####################################################
// STATIC SETTINGS
// ####################################################

const RoomURL = window.location.href;

const socket = io({ transports: ['websocket'] });

const surveyActive = true;

const url = {
    ipLookup: 'https://extreme-ip-lookup.com/json/?key=demo2',
    survey: 'https://www.questionpro.com/t/AUs7VZq02P',
};

const _PEER = {
    audioOn: '<i class="fas fa-microphone"></i>',
    audioOff: '<i style="color: red;" class="fas fa-microphone-slash"></i>',
    videoOn: '<i class="fas fa-video"></i>',
    videoOff: '<i style="color: red;" class="fas fa-video-slash"></i>',
    raiseHand: '<i style="color: rgb(0, 255, 71);" class="fas fa-hand-paper pulsate"></i>',
    lowerHand: '',
    acceptPeer: '<i class="fas fa-check"></i>',
    ejectPeer: '<i class="fas fa-times"></i>',
    sendFile: '<i class="fas fa-upload"></i>',
    sendMsg: '<i class="fas fa-paper-plane"></i>',
    sendVideo: '<i class="fab fa-youtube"></i>',
};

const userAgent = navigator.userAgent.toLowerCase();
const isTabletDevice = isTablet(userAgent);
const isIPadDevice = isIpad(userAgent);

const wbImageInput = 'image/*';
const wbWidth = 1200;
const wbHeight = 600;

const swalImageUrl = '../images/pricing-illustration.svg';

// ####################################################
// DYNAMIC SETTINGS
// ####################################################

let currentTheme = 'dark';
let swalBackground = 'radial-gradient(#393939, #000000)'; //'rgba(0, 0, 0, 0.7)';

let rc = null;
let producer = null;
let participantsCount = 0;
let lobbyParticipantsCount = 0;
let chatMessagesId = 0;

let room_id = getRoomId();
let room_password = getRoomPassword();
let peer_name = getPeerName();
let notify = getNotify();

let peer_geo = null;
let peer_info = null;

let isSoundEnabled = true;
let isLobbyEnabled = false;
let isLobbyOpen = false;
let isEnumerateAudioDevices = false;
let isEnumerateVideoDevices = false;
let isAudioAllowed = false;
let isVideoAllowed = false;
let isVideoPrivacyActive = false;
let isScreenAllowed = getScreen();
let isAudioVideoAllowed = false;
let isParticipantsListOpen = false;
let isVideoControlsOn = false;
let isChatPasteTxt = false;
let isChatMarkdownOn = false;
let joinRoomWithoutAudioVideo = true;
let initAudioButton = null;
let initVideoButton = null;
let initAudioVideoButton = null;

let recTimer = null;
let recElapsedTime = null;

let wbCanvas = null;
let wbIsDrawing = false;
let wbIsOpen = false;
let wbIsRedoing = false;
let wbIsEraser = false;
let wbIsBgTransparent = false;
let wbPop = [];

let isButtonsVisible = false;
let isButtonsBarOver = false;

let isRoomLocked = false;

// ####################################################
// LANGUAGE SETTINGS
// ####################################################

const languages = {
    en: {
        shareRoom: 'Share room',
        startAudio: 'Start the audio',
        stopAudio: 'Stop the audio',
        startVideo: 'Start the video',
        stopVideo: 'Stop the video',
        startScreen: 'Start screen share',
        stopScreen: 'Stop screen share',
        swapCamera: 'Swap the camera',
        toggleChat: 'Toggle the chat',
        toggleWhiteboard: 'Toggle the whiteboard',
        toggleSettings: 'Toggle the settings',
        aboutProject: 'About this project',
        leaveRoom: 'Leave room',
        close: 'Close',
        devices: 'Devices',
        recording: 'Recording',
        room: 'Room',
        videoShare: 'Video share',
        aspect: 'Aspect',
        styling: 'Styling',
        // languages: 'Languages',
        accept: 'Accept',
        reject: 'Reject',
        lobbyMode: 'Lobby mode lets you protect your meeting by only allowing people to enter after a formal approval by a moderator',
        toggleSounds: 'Toggle the sounds notifications',
        transparentBackground: 'Toggle transparent background',
        backgroundColor: 'Background color',
        drawingColor: 'Drawing color',
        drawingMode: 'Drawing mode',
        objectMode: 'Object mode',
        undo: 'Undo',
        redo: 'Redo',
        addImageFile: 'Add image file',
        addImageUrl: 'Add image url',
        addText: 'Add text',
        addLine: 'Add line',
        addRectangle: 'Add rectangle',
        addCircle: 'Add circle',
        save: 'Save',
        eraser: 'Eraser',
        clean: 'Clean',
        cleanText: 'Clean',
        paste: 'Paste',
        send: 'Send',
        showChatOnMsg: "Show me when I'm receive a new message",
        startSpeechRecognition: 'Start speech recognition',
        stopSpeechRecognition: 'Stop speech recognition',
        emoji: 'Emoji',
        markdown: 'Markdown',
        shareFile: 'Share file',
        sessionTime: 'Session time',
    },
    es: {
        shareRoom: 'Compartir sala',
        startAudio: 'Iniciar audio',
        stopAudio: 'Detener audio',
        startVideo: 'Iniciar video',
        stopVideo: 'Detener video',
        startScreen: 'Iniciar compartir pantalla',
        stopScreen: 'Detener compartir pantalla',
        swapCamera: 'Cambiar cámara',
        toggleChat: 'Alternar chat',
        toggleWhiteboard: 'Alternar pizarra',
        toggleSettings: 'Alternar configuraciones',
        aboutProject: 'Acerca de este proyecto',
        leaveRoom: 'Salir de la sala',
        close: 'Cerrar',
        devices: 'Dispositivos',
        recording: 'Grabación',
        room: 'Sala',
        videoShare: 'Compartir video',
        aspect: 'Aspecto',
        styling: 'Estilo',
        // languages: 'Idiomas',
        accept: 'Aceptar',
        reject: 'Rechazar',
        lobbyMode: 'El modo lobby permite proteger su reunión permitiendo que las personas ingresen solo después de una aprobación formal por parte de un moderador',
        toggleSounds: 'Alternar notificaciones de sonido',
        transparentBackground: 'Alternar fondo transparente',
        backgroundColor: 'Color de fondo',
        drawingColor: 'Color de dibujo',
        drawingMode: 'Modo de dibujo',
        objectMode: 'Modo de objeto',
        undo: 'Deshacer',
        redo: 'Rehacer',
        addImageFile: 'Agregar archivo de imagen',
        addImageUrl: 'Agregar URL de imagen',
        addText: 'Agregar texto',
        addLine: 'Agregar línea',
        addRectangle: 'Agregar rectángulo',
        addCircle: 'Agregar círculo',
        save: 'Guardar',
        eraser: 'Borrador',
        clean: 'Limpiar',
        cleanText: 'Limpiar',
        paste: 'Pegar',
        send: 'Enviar',
        showChatOnMsg: "Mostrarme cuando reciba un nuevo mensaje",
        startSpeechRecognition: 'Iniciar reconocimiento de voz',
        stopSpeechRecognition: 'Detener reconocimiento de voz',
        emoji: 'Emoji',
        markdown: 'Markdown',
        shareFile: 'Compartir archivo',
        sessionTime: 'Tiempo de sesión',
    },
    // Add more languages as needed
};

// let currentLanguage = 'en';

// function setLanguage(lang) {
//     currentLanguage = lang;
//     updateUIText();
// }
// Room.js or main.js

let currentLanguage = 'en';

function setLanguage(lang) {
  console.log(`🌐 Selected Language: ${lang}`);
  currentLanguage = lang;
  updateUIText(); // optional
}

function updateUIText() {
    const lang = languages[currentLanguage];
    setTippy('shareButton', lang.shareRoom, 'right');
    setTippy('startAudioButton', lang.startAudio, 'right');
    setTippy('stopAudioButton', lang.stopAudio, 'right');
    setTippy('startVideoButton', lang.startVideo, 'right');
    setTippy('stopVideoButton', lang.stopVideo, 'right');
    setTippy('startScreenButton', lang.startScreen, 'right');
    setTippy('stopScreenButton', lang.stopScreen, 'right');
    setTippy('swapCameraButton', lang.swapCamera, 'right');
    setTippy('chatButton', lang.toggleChat, 'right');
    setTippy('whiteboardButton', lang.toggleWhiteboard, 'right');
    setTippy('settingsButton', lang.toggleSettings, 'right');
    setTippy('aboutButton', lang.aboutProject, 'right');
    setTippy('exitButton', lang.leaveRoom, 'right');
    setTippy('mySettingsCloseBtn', lang.close, 'right');
    // setTippy('tabDevicesBtn', lang.devices, 'top');
    // setTippy('tabRecordingBtn', lang.recording, 'top');
    // setTippy('tabRoomBtn', lang.room, 'top');
    // setTippy('tabVideoShareBtn', lang.videoShare, 'top');
    // setTippy('tabAspectBtn', lang.aspect, 'top');
    // setTippy('tabStylingBtn', lang.styling, 'top');
    // setTippy('tabLanguagesBtn', lang.languages, 'top');
    // setTippy('lobbyAcceptAllBtn', lang.accept, 'top');
    // setTippy('lobbyRejectAllBtn', lang.reject, 'top');
    setTippy('switchLobby', lang.lobbyMode, 'right');
    setTippy('switchSounds', lang.toggleSounds, 'right');
    setTippy('whiteboardGhostButton', lang.transparentBackground, 'bottom');
    setTippy('wbBackgroundColorEl', lang.backgroundColor, 'bottom');
    setTippy('wbDrawingColorEl', lang.drawingColor, 'bottom');
    setTippy('whiteboardPencilBtn', lang.drawingMode, 'bottom');
    setTippy('whiteboardObjectBtn', lang.objectMode, 'bottom');
    setTippy('whiteboardUndoBtn', lang.undo, 'bottom');
    setTippy('whiteboardRedoBtn', lang.redo, 'bottom');
    setTippy('whiteboardImgFileBtn', lang.addImageFile, 'bottom');
    setTippy('whiteboardImgUrlBtn', lang.addImageUrl, 'bottom');
    setTippy('whiteboardTextBtn', lang.addText, 'bottom');
    setTippy('whiteboardLineBtn', lang.addLine, 'bottom');
    setTippy('whiteboardRectBtn', lang.addRectangle, 'bottom');
    setTippy('whiteboardCircleBtn', lang.addCircle, 'bottom');
    setTippy('whiteboardSaveBtn', lang.save, 'bottom');
    setTippy('whiteboardEraserBtn', lang.eraser, 'bottom');
    setTippy('whiteboardCleanBtn', lang.clean, 'bottom');
    setTippy('whiteboardCloseBtn', lang.close, 'right');
    setTippy('chatCleanTextButton', lang.cleanText, 'top');
    setTippy('chatPasteButton', lang.paste, 'top');
    setTippy('chatSendButton', lang.send, 'top');
    setTippy('showChatOnMsg', lang.showChatOnMsg, 'top');
    setTippy('chatSpeechStartButton', lang.startSpeechRecognition, 'top');
    setTippy('chatSpeechStopButton', lang.stopSpeechRecognition, 'top');
    setTippy('chatEmojiButton', lang.emoji, 'top');
    setTippy('chatMarkdownButton', lang.markdown, 'top');
    setTippy('chatShareFileButton', lang.shareFile, 'top');
    setTippy('chatCleanButton', lang.clean, 'bottom');
    setTippy('chatSaveButton', lang.save, 'bottom');
    setTippy('chatGhostButton', lang.transparentBackground, 'bottom');
    setTippy('chatCloseButton', lang.close, 'right');
    setTippy('participantsCloseBtn', lang.close, 'left');
    setTippy('sessionTime', lang.sessionTime, 'top');
}

// ####################################################
// INIT ROOM
// ####################################################

function initClient() {
    if (!DetectRTC.isMobileDevice) {
        updateUIText();
    }
    setupWhiteboard();
    initEnumerateDevices();

    // Initialize speech recognition elements - Part of the 2nd Code
    // const languageSelect = document.createElement('select');
    // languageSelect.id = 'languageSelect';

    const languagesArray = Object.keys(languages);

    languagesArray.forEach(lang => {
        const option = document.createElement('option');
        option.value = lang;
        option.textContent = languages[lang].languages;
         // Use 'languages' to display name
        languageSelect.appendChild(option);
    });

    const startButton = document.createElement('button');
    startButton.id = 'startButton';
    // startButton.textContent = 'Start Listening';

    document.body.appendChild(languageSelect);
    document.body.appendChild(startButton);

    // Event listeners from the 2nd Code
    document.getElementById('languageSelect').addEventListener('change', setLanguage);
    document.getElementById('startButton').addEventListener('click', startSpeech);
}

// ####################################################
// HANDLE TOOLTIP
// ####################################################

function setTippy(elem, content, placement, allowHTML = false) {
    tippy(document.getElementById(elem), {
        content: content,
        placement: placement,
        allowHTML: allowHTML,
    });
}

// ####################################################
// GET ROOM ID
// ####################################################

function getRoomId() {
    let qs = new URLSearchParams(window.location.search);
    let queryRoomId = qs.get('room');
    let roomId = queryRoomId ? queryRoomId : location.pathname.substring(6);
    if (roomId == '') {
        roomId = makeId(12);
    }
    return roomId;
}

function makeId(length) {
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

// ####################################################
// ENUMERATE DEVICES
// ####################################################

async function initEnumerateDevices() {
    console.log('01 ----> init Enumerate Devices');
    await initEnumerateAudioDevices();
    await initEnumerateVideoDevices();
    if (!isAudioAllowed && !isVideoAllowed && !joinRoomWithoutAudioVideo) {
        openURL(`/permission?room_id=${room_id}&message=Not allowed both Audio and Video`);
    } else {
        hide(loadingDiv);
        getPeerGeoLocation();
        whoAreYou();
    }
}

async function initEnumerateAudioDevices() {
    if (isEnumerateAudioDevices) return;
    // allow the audio
    await navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
            enumerateAudioDevices(stream);
            isAudioAllowed = true;
        })
        .catch(() => {
            isAudioAllowed = false;
        });
}

async function initEnumerateVideoDevices() {
    if (isEnumerateVideoDevices) return;
    // allow the video
    await navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
            enumerateVideoDevices(stream);
            isVideoAllowed = true;
        })
        .catch(() => {
            isVideoAllowed = false;
        });
}

function enumerateAudioDevices(stream) {
    console.log('02 ----> Get Audio Devices');
    navigator.mediaDevices
        .enumerateDevices()
        .then((devices) =>
            devices.forEach((device) => {
                let el = null;
                if ('audioinput' === device.kind) {
                    el = microphoneSelect;
                    RoomClient.DEVICES_COUNT.audio++;
                } else if ('audiooutput' === device.kind) {
                    el = speakerSelect;
                    RoomClient.DEVICES_COUNT.speaker++;
                }
                if (!el) return;
                addChild(device, el);
            }),
        )
        .then(() => {
            stopTracks(stream);
            isEnumerateAudioDevices = true;
            speakerSelect.disabled = !('sinkId' in HTMLMediaElement.prototype);
        });
}

function enumerateVideoDevices(stream) {
    console.log('03 ----> Get Video Devices');
    navigator.mediaDevices
        .enumerateDevices()
        .then((devices) =>
            devices.forEach((device) => {
                let el = null;
                if ('videoinput' === device.kind) {
                    el = videoSelect;
                    RoomClient.DEVICES_COUNT.video++;
                }
                if (!el) return;
                addChild(device, el);
            }),
        )
        .then(() => {
            stopTracks(stream);
            isEnumerateVideoDevices = true;
        });
}

function stopTracks(stream) {
    stream.getTracks().forEach((track) => {
        track.stop();
    });
}

function addChild(device, el) {
    let option = document.createElement('option');
    option.value = device.deviceId;
    option.innerText = device.label;
    el.appendChild(option);
}

// ####################################################
// API CHECK
// ####################################################

function getScreen() {
    let qs = new URLSearchParams(window.location.search);
    let screen = qs.get('screen');
    if (screen) {
        screen = screen.toLowerCase();
        let queryScreen = screen === '1' || screen === 'true';
        if (queryScreen != null && (navigator.getDisplayMedia || navigator.mediaDevices.getDisplayMedia))
            return queryScreen;
    }
    return false;
}

function getNotify() {
    let qs = new URLSearchParams(window.location.search);
    let notify = qs.get('notify');
    if (notify) {
        notify = notify.toLowerCase();
        let queryNotify = notify === '1' || notify === 'true';
        if (queryNotify != null) return queryNotify;
    }
    return true;
}

function getPeerName() {
    let qs = new URLSearchParams(window.location.search);
    return qs.get('name');
}

function getRoomPassword() {
    let qs = new URLSearchParams(window.location.search);
    let roomPassword = qs.get('password');
    if (roomPassword) {
        let queryNoRoomPassword = roomPassword === '0' || roomPassword === 'false';
        if (queryNoRoomPassword) {
            roomPassword = false;
        }
        return roomPassword;
    }
}

// ####################################################
// SOME PEER INFO
// ####################################################

function getPeerInfo() {
    peer_info = {
        user_agent: userAgent,
        detect_rtc_version: DetectRTC.version,
        is_webrtc_supported: DetectRTC.isWebRTCSupported,
        is_desktop_device: !DetectRTC.isMobileDevice && !isTabletDevice && !isIPadDevice,
        is_mobile_device: DetectRTC.isMobileDevice,
        is_tablet_device: isTabletDevice,
        is_ipad_pro_device: isIPadDevice,
        os_name: DetectRTC.osName,
        os_version: DetectRTC.osVersion,
        browser_name: DetectRTC.browser.name,
        browser_version: DetectRTC.browser.version,
        peer_id: socket.id,
        peer_name: peer_name,
        peer_audio: isAudioAllowed,
        peer_video: isVideoAllowed,
        peer_screen: isScreenAllowed,
        peer_video_privacy: isVideoPrivacyActive,
        peer_hand: false,
    };
}

function getPeerGeoLocation() {
    fetch(url.ipLookup)
        .then((res) => res.json())
        .then((outJson) => {
            peer_geo = outJson;
        })
        .catch((ex) => console.warn('IP Lookup', ex));
}

// ####################################################
// ENTER YOUR NAME | Enable/Disable AUDIO/VIDEO
// ####################################################

function whoAreYou() {
    console.log('04 ----> Who are you');

    if (peer_name) {
        checkMedia();
        getPeerInfo();
        joinRoom(peer_name, room_id);
        return;
    }

    let default_name = window.localStorage.peer_name ? window.localStorage.peer_name : '';
    if (getCookie(room_id + '_name')) {
        default_name = getCookie(room_id + '_name');
    }

    Swal.fire({
        allowOutsideClick: false,
        allowEscapeKey: false,
        background: swalBackground,
        imageAlt: 'mirotalksfu-username',
        imageUrl: image.username,
        input: 'text',
        inputPlaceholder: 'Enter your name',
        inputValue: default_name,
        html: `<br />
        <div style="padding: 10px;">
            <button id="initAudioButton" class="fas fa-microphone" onclick="handleAudio(event)"></button>
            <button id="initVideoButton" class="fas fa-video" onclick="handleVideo(event)"></button>
            <button id="initAudioVideoButton" class="fas fa-eye" onclick="handleAudioVideo(event)"></button>
        </div>`,
        confirmButtonText: `Join meeting`,
        showClass: {
            popup: 'animate__animated animate__fadeInDown',
        },
        hideClass: {
            popup: 'animate__animated animate__fadeOutUp',
        },
        inputValidator: (name) => {
            if (!name) return 'Please enter your name';
            if (!getCookie(room_id + '_name')) {
                window.localStorage.peer_name = name;
            }
            setCookie(room_id + '_name', name, 30);
            peer_name = name;
        },
    }).then(() => {
        getPeerInfo();
        joinRoom(peer_name, room_id);
    });

    if (!DetectRTC.isMobileDevice) {
        setTippy('initAudioButton', 'Toggle the audio', 'left');
        setTippy('initVideoButton', 'Toggle the video', 'right');
        setTippy('initAudioVideoButton', 'Toggle the audio & video', 'right');
    }

    initAudioButton = document.getElementById('initAudioButton');
    initVideoButton = document.getElementById('initVideoButton');
    initAudioVideoButton = document.getElementById('initAudioVideoButton');
    if (!isAudioAllowed) hide(initAudioButton);
    if (!isVideoAllowed) hide(initVideoButton);
    if (!isAudioAllowed || !isVideoAllowed) hide(initAudioVideoButton);
    isAudioVideoAllowed = isAudioAllowed && isVideoAllowed;


}

function handleAudio(e) {
    isAudioAllowed = isAudioAllowed ? false : true;
    e.target.className = 'fas fa-microphone' + (isAudioAllowed ? '' : '-slash');
    setColor(e.target, isAudioAllowed ? 'white' : 'red');
    setColor(startAudioButton, isAudioAllowed ? 'white' : 'red');
}

function handleVideo(e) {
    isVideoAllowed = isVideoAllowed ? false : true;
    e.target.className = 'fas fa-video' + (isVideoAllowed ? '' : '-slash');
    setColor(e.target, isVideoAllowed ? 'white' : 'red');
    setColor(startVideoButton, isVideoAllowed ? 'white' : 'red');
}

function handleAudioVideo(e) {
    isAudioVideoAllowed = isAudioVideoAllowed ? false : true;
    isAudioAllowed = isAudioVideoAllowed;
    isVideoAllowed = isAudioVideoAllowed;
    initAudioButton.className = 'fas fa-microphone' + (isAudioVideoAllowed ? '' : '-slash');
    initVideoButton.className = 'fas fa-video' + (isAudioVideoAllowed ? '' : '-slash');
    if (!isAudioVideoAllowed) {
        hide(initAudioButton);
        hide(initVideoButton);
    }
    e.target.className = 'fas fa-eye' + (isAudioVideoAllowed ? '' : '-slash');
    setColor(e.target, isAudioVideoAllowed ? 'white' : 'red');
    setColor(initAudioButton, isAudioAllowed ? 'white' : 'red');
    setColor(initVideoButton, isVideoAllowed ? 'white' : 'red');
    setColor(startAudioButton, isAudioAllowed ? 'white' : 'red');
    setColor(startVideoButton, isVideoAllowed ? 'white' : 'red');
}

function checkMedia() {
    let qs = new URLSearchParams(window.location.search);
    let audio = qs.get('audio');
    let video = qs.get('video');
    if (audio) {
        audio = audio.toLowerCase();
        let queryPeerAudio = audio === '1' || audio === 'true';
        if (queryPeerAudio != null) isAudioAllowed = queryPeerAudio;
    }
    if (video) {
        video = video.toLowerCase();
        let queryPeerVideo = video === '1' || video === 'true';
        if (queryPeerVideo != null) isVideoAllowed = queryPeerVideo;
    }
}

// ####################################################
// SHARE ROOM
// ####################################################

async function shareRoom(useNavigator = false) {
    if (navigator.share && useNavigator) {
        try {
            await navigator.share({ url: RoomURL });
            userLog('info', 'Room Shared successfully', 'top-end');
        } catch (err) {
            share();
        }
    } else {
        share();
    }
    function share() {
        sound('open');

        Swal.fire({
            background: swalBackground,
            position: 'center',
            title: '<strong>Welcome ' + peer_name + '</strong>',
            html:
                `
            <br/>
            <div id="qrRoomContainer">
                <canvas id="qrRoom"></canvas>
            </div>
            <br/><br/>
            <p style="background:transparent; color:white;">Invite others to join. Share this meeting link.</p>
            <p style="background:transparent; color:rgb(8, 189, 89);">` +
                RoomURL +
                `</p>`,
            showDenyButton: true,
            showCancelButton: true,
            confirmButtonText: `Copy URL`,
            denyButtonText: `Email invite`,
            cancelButtonText: `Close`,
            showClass: {
                popup: 'animate__animated animate__fadeInUp',
            },
            hideClass: {
                popup: 'animate__animated animate__fadeOutUp',
            },
        }).then((result) => {
            if (result.isConfirmed) {
                copyRoomURL();
            } else if (result.isDenied) {
                let message = {
                    email: '',
                    subject: 'Please join our MiroTalkSfu Video Chat Meeting',
                    body: 'Click to join: ' + RoomURL,
                };
                shareRoomByEmail(message);
            }
            // share screen on join
            if (isScreenAllowed) {
                rc.shareScreen();
            }
        });
        makeRoomQR();
    }


}

// ####################################################
// ROOM UTILITY
// ####################################################

function makeRoomQR() {
    let qrSize = DetectRTC.isMobileDevice ? 128 : 256;
    let qr = new QRious({
        element: document.getElementById('qrRoom'),
        value: RoomURL,
    });
    qr.set({
        size: qrSize,
    });
}

function copyRoomURL() {
    let tmpInput = document.createElement('input');
    document.body.appendChild(tmpInput);
    tmpInput.value = RoomURL;
    tmpInput.select();
    tmpInput.setSelectionRange(0, 99999); // For mobile devices
    navigator.clipboard.writeText(tmpInput.value);
    document.body.removeChild(tmpInput);
    userLog('info', 'Meeting URL copied to clipboard 👍', 'top-end');
}

function shareRoomByEmail(message) {
    let email = message.email;
    let subject = message.subject;
    let emailBody = message.body;
    document.location = 'mailto:' + email + '?subject=' + subject + '&body=' + emailBody;
}

// ####################################################
// JOIN ROOM
// ####################################################

function joinRoom(peer_name, room_id) {
    if (rc && rc.isConnected()) {
        console.log('Already connected to a room');
    } else {
        console.log('05 ----> join Room ' + room_id);
        rc = new RoomClient(
            localAudio,
            remoteAudios,
            videoMediaContainer,
            videoPinMediaContainer,
            window.mediasoupClient,
            socket,
            room_id,
            peer_name,
            peer_geo,
            peer_info,
            isAudioAllowed,
            isVideoAllowed,
            isScreenAllowed,
            roomIsReady,
        );
        handleRoomClientEvents();
        //notify ? shareRoom() : sound('joined');
    }
}

function roomIsReady() {
    setTheme('dark');
    BUTTONS.main.exitButton && show(exitButton);
    BUTTONS.main.shareButton && show(shareButton);
    if (BUTTONS.settings.tabRecording) {
        show(startRecButton);
    } else {
        hide(tabRecordingBtn);
    }
    BUTTONS.main.chatButton && show(chatButton);
    !BUTTONS.chat.chatSaveButton && hide(chatSaveButton);
    BUTTONS.chat.chatEmojiButton && show(chatEmojiButton);
    BUTTONS.chat.chatMarkdownButton && show(chatMarkdownButton);
    BUTTONS.chat.chatShareFileButton && show(chatShareFileButton);
    if (isWebkitSpeechRecognitionSupported && BUTTONS.chat.chatSpeechStartButton) {
        show(chatSpeechStartButton);
    } else {
        BUTTONS.chat.chatSpeechStartButton = false;
    }
    show(chatCleanTextButton);
    show(chatPasteButton);
    show(chatSendButton);
    if (DetectRTC.isMobileDevice && BUTTONS.main.swapCameraButton) {
        show(swapCameraButton);
        setChatSize();
    } else {
        rc.makeDraggable(chatRoom, chatHeader);
        rc.makeDraggable(mySettings, mySettingsHeader);
        rc.makeDraggable(participants, participantsHeader);
        rc.makeDraggable(whiteboard, whiteboardHeader);
        rc.makeDraggable(sendFileDiv, imgShareSend);
        rc.makeDraggable(receiveFileDiv, imgShareReceive);
        rc.makeDraggable(lobby, lobbyHeader);
        if (navigator.getDisplayMedia || navigator.mediaDevices.getDisplayMedia) {
            BUTTONS.main.startScreenButton && show(startScreenButton);
        }
    }
    if (DetectRTC.browser.name != 'Safari') {
        document.onfullscreenchange = () => {
            if (!document.fullscreenElement) rc.isDocumentOnFullScreen = false;
        };
        show(fullScreenButton);
    }
    BUTTONS.main.whiteboardButton && show(whiteboardButton);
    BUTTONS.main.settingsButton && show(settingsButton);
    show(raiseHandButton);
    isAudioAllowed ? show(stopAudioButton) : BUTTONS.main.startAudioButton && show(startAudioButton);
    isVideoAllowed ? show(stopVideoButton) : BUTTONS.main.startVideoButton && show(startVideoButton);
    show(fileShareButton);
    BUTTONS.settings.participantsButton && show(participantsButton);
    BUTTONS.settings.lockRoomButton && show(lockRoomButton);
    BUTTONS.settings.lobbyButton && show(lobbyButton);
    BUTTONS.main.aboutButton && show(aboutButton);
    if (!DetectRTC.isMobileDevice) show(pinUnpinGridDiv);
    handleButtons();
    handleSelects();
    handleInputs();
    startSessionTimer();
    document.body.addEventListener('mousemove', (e) => {
        showButtons();
    });
    checkButtonsBar();
    if (room_password) {
        lockRoomButton.click();
    }
}

function hide(elem) {
    elem.className = 'hidden';
}

function show(elem) {
    elem.className = '';
}

function setColor(elem, color) {
    elem.style.color = color;
}

// ####################################################
// SET CHAT MOBILE
// ####################################################

function setChatSize() {
    document.documentElement.style.setProperty('--msger-width', '99%');
    document.documentElement.style.setProperty('--msger-height', '99%');
}

// ####################################################
// SESSION TIMER
// ####################################################

function startSessionTimer() {
    sessionTime.style.display = 'inline';
    let callStartTime = Date.now();
    setInterval(function printTime() {
        let callElapsedTime = Date.now() - callStartTime;
        sessionTime.innerHTML = ' ' + getTimeToString(callElapsedTime);
    }, 1000);
}

function getTimeToString(time) {
    let diffInHrs = time / 3600000;
    let hh = Math.floor(diffInHrs);
    let diffInMin = (diffInHrs - hh) * 60;
    let mm = Math.floor(diffInMin);
    let diffInSec = (diffInMin - mm) * 60;
    let ss = Math.floor(diffInSec);
    let formattedHH = hh.toString().padStart(2, '0');
    let formattedMM = mm.toString().padStart(2, '0');
    let formattedSS = ss.toString().padStart(2, '0');
    return `${formattedHH}:${formattedMM}:${formattedSS}`;
}

// ####################################################
// RECORDING TIMER
// ####################################################

function secondsToHms(d) {
    d = Number(d);
    let h = Math.floor(d / 3600);
    let m = Math.floor((d % 3600) / 60);
    let s = Math.floor((d % 3600) % 60);
    let hDisplay = h > 0 ? h + 'h' : '';
    let mDisplay = m > 0 ? m + 'm' : '';
    let sDisplay = s > 0 ? s + 's' : '';
    return hDisplay + ' ' + mDisplay + ' ' + sDisplay;
}

function startRecordingTimer() {
    recElapsedTime = 0;
    recTimer = setInterval(function printTime() {
        if (rc.isRecording()) {
            recElapsedTime++;
            recordingStatus.innerHTML = '🔴 REC ' + secondsToHms(recElapsedTime);
        }
    }, 1000);
}
function stopRecordingTimer() {
    clearInterval(recTimer);
}

// ####################################################
// HTML BUTTONS
// ####################################################

function handleButtons() {
    control.onmouseover = () => {
        isButtonsBarOver = true;
    };
    control.onmouseout = () => {
        isButtonsBarOver = false;
    };
    exitButton.onclick = () => {
        rc.exitRoom();
    };
    shareButton.onclick = () => {
        shareRoom(true);
    };
    settingsButton.onclick = () => {
        rc.toggleMySettings();
    };
    mySettingsCloseBtn.onclick = () => {
        rc.toggleMySettings();
    };
    tabDevicesBtn.onclick = (e) => {
        rc.openTab(e, 'tabDevices');
    };
    tabRecordingBtn.onclick = (e) => {
        rc.openTab(e, 'tabRecording');
    };
    tabRoomBtn.onclick = (e) => {
        rc.openTab(e, 'tabRoom');
    };
    tabVideoShareBtn.onclick = (e) => {
        rc.openTab(e, 'tabVideoShare');
    };
    tabAspectBtn.onclick = (e) => {
        rc.openTab(e, 'tabAspect');
    };
    tabStylingBtn.onclick = (e) => {
        rc.openTab(e, 'tabStyling');
    };
    tabLanguagesBtn.onclick = (e) => {
        rc.openTab(e, 'tabLanguages');
    };
    chatButton.onclick = () => {
        rc.toggleChat();
    };
    chatGhostButton.onclick = (e) => {
        rc.chatToggleBg();
    };
    chatCleanButton.onclick = () => {
        rc.chatClean();
    };
    chatSaveButton.onclick = () => {
        rc.chatSave();
    };
    chatCloseButton.onclick = () => {
        rc.toggleChat();
    };
    chatCleanTextButton.onclick = () => {
        rc.cleanMessage();
    };
    chatPasteButton.onclick = () => {
        rc.pasteMessage();
    };
    chatSendButton.onclick = () => {
        rc.sendMessage();
    };
    chatEmojiButton.onclick = () => {
        rc.toggleChatEmoji();
    };
    chatMarkdownButton.onclick = () => {
        isChatMarkdownOn = !isChatMarkdownOn;
        setColor(chatMarkdownButton, isChatMarkdownOn ? 'lime' : 'white');
    };
    chatShareFileButton.onclick = () => {
        fileShareButton.click();
    };
    chatSpeechStartButton.onclick = () => {
        startSpeech(true);
    };
    chatSpeechStopButton.onclick = () => {
        startSpeech(false);
    };
    fullScreenButton.onclick = () => {
        rc.toggleFullScreen();
    };
    startRecButton.onclick = () => {
        rc.startRecording();
    };
    stopRecButton.onclick = () => {
        rc.stopRecording();
    };
    pauseRecButton.onclick = () => {
        rc.pauseRecording();
    };
    resumeRecButton.onclick = () => {
        rc.resumeRecording();
    };
    swapCameraButton.onclick = () => {
        rc.closeThenProduce(RoomClient.mediaType.video, null, true);
    };
    raiseHandButton.onclick = () => {
        rc.updatePeerInfo(peer_name, rc.peer_id, 'hand', true);
    };
    lowerHandButton.onclick = () => {
        rc.updatePeerInfo(peer_name, rc.peer_id, 'hand', false);
    };
    startAudioButton.onclick = () => {
        setAudioButtonsDisabled(true);
        if (!isEnumerateAudioDevices) initEnumerateAudioDevices();
        rc.produce(RoomClient.mediaType.audio, microphoneSelect.value);
        rc.updatePeerInfo(peer_name, rc.peer_id, 'audio', true);
        // rc.resumeProducer(RoomClient.mediaType.audio);
    };
    stopAudioButton.onclick = () => {
        setAudioButtonsDisabled(true);
        rc.closeProducer(RoomClient.mediaType.audio);
        rc.updatePeerInfo(peer_name, rc.peer_id, 'audio', false);
        // rc.pauseProducer(RoomClient.mediaType.audio);
    };
    startVideoButton.onclick = () => {
        setVideoButtonsDisabled(true);
        if (!isEnumerateVideoDevices) initEnumerateVideoDevices();
        rc.produce(RoomClient.mediaType.video, videoSelect.value);
        // rc.resumeProducer(RoomClient.mediaType.video);
    };
    stopVideoButton.onclick = () => {
        setVideoButtonsDisabled(true);
        rc.closeProducer(RoomClient.mediaType.video);
        // rc.pauseProducer(RoomClient.mediaType.video);
    };
    startScreenButton.onclick = () => {
        rc.produce(RoomClient.mediaType.screen);
    };
    stopScreenButton.onclick = () => {
        rc.closeProducer(RoomClient.mediaType.screen);
    };
    fileShareButton.onclick = () => {
        rc.selectFileToShare(rc.peer_id, true);
    };
    videoShareButton.onclick = () => {
        rc.shareVideo('all');
    };
    videoCloseBtn.onclick = () => {
        rc.closeVideo(true);
    };
    sendAbortBtn.onclick = () => {
        rc.abortFileTransfer();
    };
    receiveHideBtn.onclick = () => {
        rc.hideFileTransfer();
    };
    whiteboardButton.onclick = () => {
        toggleWhiteboard();
    };
    whiteboardPencilBtn.onclick = () => {
        whiteboardIsDrawingMode(true);
    };
    whiteboardObjectBtn.onclick = () => {
        whiteboardIsDrawingMode(false);
    };
    whiteboardUndoBtn.onclick = () => {
        whiteboardAction(getWhiteboardAction('undo'));
    };
    whiteboardRedoBtn.onclick = () => {
        whiteboardAction(getWhiteboardAction('redo'));
    };
    whiteboardSaveBtn.onclick = () => {
        wbCanvasSaveImg();
    };
    whiteboardImgFileBtn.onclick = () => {
        whiteboardAddObj('imgFile');
    };
    whiteboardImgUrlBtn.onclick = () => {
        whiteboardAddObj('imgUrl');
    };
    whiteboardTextBtn.onclick = () => {
        whiteboardAddObj('text');
    };
    whiteboardLineBtn.onclick = () => {
        whiteboardAddObj('line');
    };
    whiteboardRectBtn.onclick = () => {
        whiteboardAddObj('rect');
    };
    whiteboardCircleBtn.onclick = () => {
        whiteboardAddObj('circle');
    };
    whiteboardEraserBtn.onclick = () => {
        whiteboardIsEraser(true);
    };
    whiteboardCleanBtn.onclick = () => {
        confirmClearBoard();
    };
    whiteboardCloseBtn.onclick = () => {
        whiteboardAction(getWhiteboardAction('close'));
    };
    participantsButton.onclick = () => {
        rc.toggleMySettings();
        getRoomParticipants();
    };
    participantsCloseBtn.onclick = () => {
        toggleParticipants();
    };
    lockRoomButton.onclick = () => {
        rc.roomAction('lock');
    };
    unlockRoomButton.onclick = () => {
        rc.roomAction('unlock');
    };
    aboutButton.onclick = () => {
        showAbout();
    };
}

// ####################################################
// HTML SELECTS
// ####################################################

function handleSelects() {
    // devices options
    videoSelect.onchange = () => {
        rc.closeThenProduce(RoomClient.mediaType.video, videoSelect.value);
        rc.setLocalStorageDevices(RoomClient.mediaType.video, videoSelect.selectedIndex, videoSelect.value);
    };
    videoQuality.onchange = () => {
        rc.closeThenProduce(RoomClient.mediaType.video, videoSelect.value);
    };
    microphoneSelect.onchange = () => {
        rc.closeThenProduce(RoomClient.mediaType.audio, microphoneSelect.value);
        rc.setLocalStorageDevices(RoomClient.mediaType.audio, microphoneSelect.selectedIndex, microphoneSelect.value);
    };
    speakerSelect.onchange = () => {
        rc.attachSinkId(rc.myAudioEl, speakerSelect.value);
        rc.setLocalStorageDevices(RoomClient.mediaType.speaker, speakerSelect.selectedIndex, speakerSelect.value);
    };
    // room
    switchSounds.onchange = (e) => {
        isSoundEnabled = e.currentTarget.checked;
    };
    switchLobby.onchange = (e) => {
        isLobbyEnabled = e.currentTarget.checked;
        rc.roomAction(isLobbyEnabled ? 'lobbyOn' : 'lobbyOff');
        rc.lobbyToggle();
    };
    // styling
    BtnsAspectRatio.onchange = () => {
        setAspectRatio(BtnsAspectRatio.value);
    };
    BtnVideoObjectFit.onchange = () => {
        rc.handleVideoObjectFit(BtnVideoObjectFit.value);
    }; // cover
    BtnVideoObjectFit.selectedIndex = 2;

    BtnVideoControls.onchange = () => {
        rc.handleVideoControls(BtnVideoControls.value);
    };
    selectTheme.onchange = () => {
        setTheme(selectTheme.value);
    };
    BtnsBarPosition.onchange = () => {
        rc.changeBtnsBarPosition(BtnsBarPosition.value);
    };
    pinVideoPosition.onchange = () => {
        rc.togglePin(pinVideoPosition.value);
    };
    // chat
    showChatOnMsg.onchange = (e) => {
        sound('click');
        rc.showChatOnMessage = e.currentTarget.checked;
        if (rc.showChatOnMessage) {
            userLog('info', "Chat will be shown, when I'm receive a new message", 'top-end');
        } else {
            userLog('info', "Chat not will be shown, when I'm receive a new message", 'top-end');
        }
    };
    // whiteboard options
    wbDrawingColorEl.onchange = () => {
        wbCanvas.freeDrawingBrush.color = wbDrawingColorEl.value;
        whiteboardIsDrawingMode(true);
    };
    wbBackgroundColorEl.onchange = () => {
        setWhiteboardBgColor(wbBackgroundColorEl.value);
    };
    whiteboardGhostButton.onclick = (e) => {
        wbIsBgTransparent = !wbIsBgTransparent;
        setWhiteboardBgColor(wbIsBgTransparent ? 'rgba(0, 0, 0, 0.100)' : wbBackgroundColorEl.value);
    };
}

// ####################################################
// HTML INPUTS
// ####################################################

function handleInputs() {
    chatMessage.onkeyup = (e) => {
        if (e.keyCode === 13 && (DetectRTC.isMobileDevice || !e.shiftKey)) {
            e.preventDefault();
            chatSendButton.click();
        }
    };
    chatMessage.oninput = function () {
        const chatInputEmoji = {
            '<3': '\u2764\uFE0F',
            '</3': '\uD83D\uDC94',
            ':D': '\uD83D\uDE00',
            ':)': '\uD83D\uDE03',
            ';)': '\uD83D\uDE09',
            ':(': '\uD83D\uDE12',
            ':p': '\uD83D\uDE1B',
            ';p': '\uD83D\uDE1C',
            ":'(": '\uD83D\uDE22',
            ':+1:': '\uD83D\uDC4D',
        };
        for (let i in chatInputEmoji) {
            let regex = new RegExp(i.replace(/([()[{*+.$^\\|?])/g, '\\$1'), 'gim');
            this.value = this.value.replace(regex, chatInputEmoji[i]);
        }
        rc.checkLineBreaks();
    };

    chatMessage.onpaste = () => {
        isChatPasteTxt = true;
        rc.checkLineBreaks();
    };

    const pickerOptions = {
        theme: 'dark',
        onEmojiSelect: addEmojiToMsg,
    };
    const emojiPicker = new EmojiMart.Picker(pickerOptions);
    rc.getId('chatEmoji').appendChild(emojiPicker);

    function addEmojiToMsg(data) {
        chatMessage.value += data.native;
        rc.toggleChatEmoji();
    }
}

// ####################################################
// ROOM CLIENT EVENT LISTNERS
// ####################################################
function handleRoomClientEvents() {
    // Existing event listeners
    rc.on(RoomClient.EVENTS.startRec, () => {
        console.log('Room Client start recording');
        hide(startRecButton);
        show(stopRecButton);
        show(pauseRecButton);
        startRecordingTimer();
    });

    rc.on(RoomClient.EVENTS.pauseRec, () => {
        console.log('Room Client pause recording');
        hide(pauseRecButton);
        show(resumeRecButton);
    });

    rc.on(RoomClient.EVENTS.resumeRec, () => {
        console.log('Room Client resume recording');
        hide(resumeRecButton);
        show(pauseRecButton);
    });

    rc.on(RoomClient.EVENTS.stopRec, () => {
        console.log('Room Client stop recording');
        hide(stopRecButton);
        hide(pauseRecButton);
        hide(resumeRecButton);
        show(startRecButton);
        stopRecordingTimer();
    });

    rc.on(RoomClient.EVENTS.startAudio, () => {
        console.log('Room Client start audio');
        hide(startAudioButton);
        show(stopAudioButton);
    });

    rc.on(RoomClient.EVENTS.stopAudio, () => {
        console.log('Room Client stop audio');
        hide(stopAudioButton);
        show(startAudioButton);
    });

    rc.on(RoomClient.EVENTS.startVideo, () => {
        console.log('Room Client start video');
        hide(startVideoButton);
        show(stopVideoButton);
    });

    rc.on(RoomClient.EVENTS.stopVideo, () => {
        console.log('Room Client stop video');
        hide(stopVideoButton);
        show(startVideoButton);
    });

    rc.on(RoomClient.EVENTS.startScreen, () => {
        console.log('Room Client start screen');
        hide(startScreenButton);
        show(stopScreenButton);
    });

    rc.on(RoomClient.EVENTS.stopScreen, () => {
        console.log('Room Client stop screen');
        hide(stopScreenButton);
        show(startScreenButton);
    });

    rc.on(RoomClient.EVENTS.raiseHand, () => {
        console.log('Room Client raise hand');
        hide(raiseHandButton);
        show(lowerHandButton);
    });

    rc.on(RoomClient.EVENTS.lowerHand, () => {
        console.log('Room Client lower hand');
        hide(lowerHandButton);
        show(raiseHandButton);
    });

    rc.on(RoomClient.EVENTS.exitRoom, () => {
        console.log('Room Client leave room');
        openURL('/newroom');
    });

    rc.on(RoomClient.EVENTS.changeLanguage, (language) => {
        console.log(`Target language set to: ${language}`);
        const selectedLang = document.getElementById('selectedLanguage');
        if (selectedLang) selectedLang.textContent = language;
    });

    const translateDropdown = document.getElementById('translateDropdown');
    const translationDisplayArea = document.getElementById('translationDisplayArea');
    const translatedTextElement = document.getElementById('translatedText');
    let isTranslationActive = false;
    const staticMessage = "This is the text I want to display."; // The message to display

    // Initially hide the caption area
    if (translationDisplayArea) {
        translationDisplayAreastyle.display = 'none';
    }

    if (translateDropdown) {
        translateDropdown.addEventListener('change', () => {
            const selectedOption = translateDropdown.value;

            if (selectedOption === 'text') {
                isTranslationActive = true;
                if (translationDisplayArea) {
                    translationDisplayArea.style.display = 'block';
                    translatedTextElement.textContent = staticMessage; // Display the specific message
                    // **[INTEGRATION POINT: START TEXT TRANSLATION]**
                    rc.emit(RoomClient.EVENTS.startTextTranslation);
                }
            } else if (selectedOption === 'voice') {
                isTranslationActive = true;
                if (translationDisplayArea) {
                    translationDisplayArea.style.display = 'block';
                    translatedTextElement.textContent = "Translation (Voice) Active...";
                    rc.emit(RoomClient.EVENTS.startVoiceTranslation);
                }
            } else {
                isTranslationActive = false;
                if (translationDisplayArea) {
                    myTextContainer.style.display = 'none';
                    translatedTextElement.textContent = "";
                    rc.emit(RoomClient.EVENTS.stopTranslation);
                }
            }
        });
    }

    function updateTranslatedText(text) {
        if (isTranslationActive && translatedTextElement) {
            translatedTextElement.textContent = text;
        }
    }

    // rc.on(RoomClient.EVENTS.receivedTranslatedText, (translatedText) => {
    //     updateTranslatedText(translatedText);
    // });

    const whiteboardButton = document.getElementById('whiteboardButton');
    if (whiteboardButton) {
        whiteboardButton.addEventListener('click', () => {
            console.log('Whiteboard button clicked (emit)');
            rc.emit(RoomClient.EVENTS.startWhiteboard); // Tumcha existing event
        });
    }

    const whiteboardPencilBtn = document.getElementById('whiteboardPencilBtn');
    if (whiteboardPencilBtn) {
        whiteboardPencilBtn.onclick = () => {
            console.log('Whiteboard pencil clicked (emit)');
            rc.emit('whiteboardPencil'); // Define a new event in RoomClient.EVENTS if needed
        };
    }

    const whiteboardObjectBtn = document.getElementById('whiteboardObjectBtn');
    if (whiteboardObjectBtn) {
        whiteboardObjectBtn.onclick = () => {
            console.log('Whiteboard object clicked (emit)');
            rc.emit('whiteboardObject'); // Define a new event
        };
    }

    const whiteboardUndoBtn = document.getElementById('whiteboardUndoBtn');
    if (whiteboardUndoBtn) {
        whiteboardUndoBtn.onclick = () => {
            console.log('Whiteboard undo clicked (emit)');
            rc.emit('whiteboardUndo'); // Define a new event
        };
    }

    const whiteboardRedoBtn = document.getElementById('whiteboardRedoBtn');
    if (whiteboardRedoBtn) {
        whiteboardRedoBtn.onclick = () => {
            console.log('Whiteboard redo clicked (emit)');
            rc.emit('whiteboardRedo');
        };
    }

    const whiteboardSaveBtn = document.getElementById('whiteboardSaveBtn');
    if (whiteboardSaveBtn) {
        whiteboardSaveBtn.onclick = () => {
            console.log('Whiteboard save clicked (emit)');
            rc.emit('whiteboardSave');
        };
    }

    const whiteboardImgFileBtn = document.getElementById('whiteboardImgFileBtn');
    if (whiteboardImgFileBtn) {
        whiteboardImgFileBtn.onclick = () => {
            console.log('Whiteboard imgFile clicked (emit)');
            rc.emit('whiteboardImgFile');
        };
    }

    const whiteboardImgUrlBtn = document.getElementById('whiteboardImgUrlBtn');
    if (whiteboardImgUrlBtn) {
        whiteboardImgUrlBtn.onclick = () => {
            console.log('Whiteboard imgUrl clicked (emit)');
            rc.emit('whiteboardImgUrl');
        };
    }

    const whiteboardTextBtn = document.getElementById('whiteboardTextBtn');
    if (whiteboardTextBtn) {
        whiteboardTextBtn.onclick = () => {
            console.log('Whiteboard text clicked (emit)');
            rc.emit('whiteboardText');
        };
    }

    const whiteboardLineBtn = document.getElementById('whiteboardLineBtn');
    if (whiteboardLineBtn) {
        whiteboardLineBtn.onclick = () => {
            console.log('Whiteboard line clicked (emit)');
            rc.emit('whiteboardLine');
        };
    }

    const whiteboardRectBtn = document.getElementById('whiteboardRectBtn');
    if (whiteboardRectBtn) {
        whiteboardRectBtn.onclick = () => {
            console.log('Whiteboard rect clicked (emit)');
            rc.emit('whiteboardRect');
        };
    }

    const whiteboardCircleBtn = document.getElementById('whiteboardCircleBtn');
    if (whiteboardCircleBtn) {
        whiteboardCircleBtn.onclick = () => {
            console.log('Whiteboard circle clicked (emit)');
            rc.emit('whiteboardCircle');
        };
    }

    const whiteboardEraserBtn = document.getElementById('whiteboardEraserBtn');
    if (whiteboardEraserBtn) {
        whiteboardEraserBtn.onclick = () => {
            console.log('Whiteboard eraser clicked (emit)');
            rc.emit('whiteboardEraser');
        };
    }

    const whiteboardCleanBtn = document.getElementById('whiteboardCleanBtn');
    if (whiteboardCleanBtn) {
        whiteboardCleanBtn.onclick = () => {
            console.log('Whiteboard clean clicked (emit)');
            rc.emit('whiteboardClean');
        };
    }

    const whiteboardCloseBtn = document.getElementById('whiteboardCloseBtn');
    if (whiteboardCloseBtn) {
        whiteboardCloseBtn.onclick = () => {
            console.log('Whiteboard close clicked (emit)');
            rc.emit('whiteboardClose');
        };
    }

    // Participants Button Integration
    const participantsButton = document.getElementById('participantsButton');
    if (participantsButton) {
        participantsButton.onclick = () => {
            console.log('Participants button clicked (emit)');
            rc.emit('toggleParticipants');
        };
    }
}

document.addEventListener('DOMContentLoaded', handleRoomClientEvents); 
      
      
    


// ####################################################
// UTILITY
// ####################################################

function leaveFeedback() {
    Swal.fire({
        allowOutsideClick: false,
        allowEscapeKey: false,
        showDenyButton: true,
        background: swalBackground,
        imageUrl: image.feedback,
        title: 'Leave a feedback',
        text: 'Do you want to rate your MiroTalk experience?',
        confirmButtonText: `Yes`,
        denyButtonText: `No`,
        showClass: {
            popup: 'animate__animated animate__fadeInDown',
        },
        hideClass: {
            popup: 'animate__animated animate__fadeOutUp',
        },
    }).then((result) => {
        if (result.isConfirmed) {
            openURL(url.survey);
        } else {
            openURL('/newroom');
        }
    });
}

function userLog(icon, message, position, timer = 3000) {
    const Toast = Swal.mixin({
        background: swalBackground,
        toast: true,
        position: position,
        showConfirmButton: false,
        timer: timer,
        timerProgressBar: true,
    });
    Toast.fire({
        icon: icon,
        title: message,
    });
}

function saveDataToFile(dataURL, fileName) {
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = dataURL;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(dataURL);
    }, 100);
}

function getDataTimeString() {
    const d = new Date();
    const date = d.toISOString().split('T')[0];
    const time = d.toTimeString().split(' ')[0];
    return `${date}-${time}`;
}

function showButtons() {
    if (
        isButtonsBarOver ||
        isButtonsVisible ||
        (rc.isMobileDevice && rc.isChatOpen) ||
        (rc.isMobileDevice && rc.isMySettingsOpen)
    )
        return;
    toggleClassElements('videoMenuBar', 'inline');
    control.style.display = 'flex';
    isButtonsVisible = true;
}

function checkButtonsBar() {
    if (!isButtonsBarOver) {
        toggleClassElements('videoMenuBar', 'none');
        control.style.display = 'none';
        isButtonsVisible = false;
    }
    setTimeout(() => {
        checkButtonsBar();
    }, 10000);
}

function toggleClassElements(className, displayState) {
    let elements = rc.getEcN(className);
    for (let i = 0; i < elements.length; i++) {
        elements[i].style.display = displayState;
    }
}

function setAudioButtonsDisabled(disabled) {
    startAudioButton.disabled = disabled;
    stopAudioButton.disabled = disabled;
}

function setVideoButtonsDisabled(disabled) {
    startVideoButton.disabled = disabled;
    stopVideoButton.disabled = disabled;
}

async function sound(name) {
    if (!isSoundEnabled) return;
    let sound = '../sounds/' + name + '.wav';
    let audio = new Audio(sound);
    try {
        audio.volume = 0.5;
        await audio.play();
    } catch (err) {
        return false;
    }
}

function isImageURL(url) {
    return url.match(/\.(jpeg|jpg|gif|png|tiff|bmp)$/) != null;
}

function isTablet(userAgent) {
    return /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/.test(
        userAgent,
    );
}

function isIpad(userAgent) {
    return /macintosh/.test(userAgent) && 'ontouchend' in document;
}

function openURL(url, blank = false) {
    blank ? window.open(url, '_blank') : (window.location.href = url);
}

function setCookie(name, value, expDays) {
    let date = new Date();
    date.setTime(date.getTime() + expDays * 24 * 60 * 60 * 1000);
    const expires = 'expires=' + date.toUTCString();
    document.cookie = name + '=' + value + '; ' + expires + '; path=/';
}

function getCookie(cName) {
    const name = cName + '=';
    const cDecoded = decodeURIComponent(document.cookie);
    const cArr = cDecoded.split('; ');
    let res;
    cArr.forEach((val) => {
        if (val.indexOf(name) === 0) res = val.substring(name.length);
    });
    return res;
}

// ####################################################
// HANDLE WHITEBOARD
// ####################################################

function toggleWhiteboard() {
    if (!wbIsOpen) rc.sound('open');
    let whiteboard = rc.getId('whiteboard');
    whiteboard.classList.toggle('show');
    whiteboard.style.top = '50%';
    whiteboard.style.left = '50%';
    wbIsOpen = wbIsOpen ? false : true;
}

function setupWhiteboard() {
    setupWhiteboardCanvas();
    setupWhiteboardCanvasSize();
    setupWhiteboardLocalListners();
}

function setupWhiteboardCanvas() {
    wbCanvas = new fabric.Canvas('wbCanvas');
    wbCanvas.freeDrawingBrush.color = '#FFFFFF';
    wbCanvas.freeDrawingBrush.width = 3;
    whiteboardIsDrawingMode(true);
}

function setupWhiteboardCanvasSize() {
    let optimalSize = [wbWidth, wbHeight];
    let scaleFactorX = window.innerWidth / optimalSize[0];
    let scaleFactorY = window.innerHeight / optimalSize[1];
    if (scaleFactorX < scaleFactorY && scaleFactorX < 1) {
        wbCanvas.setWidth(optimalSize[0] * scaleFactorX);
        wbCanvas.setHeight(optimalSize[1] * scaleFactorX);
        wbCanvas.setZoom(scaleFactorX);
        setWhiteboardSize(optimalSize[0] * scaleFactorX, optimalSize[1] * scaleFactorX);
    } else if (scaleFactorX > scaleFactorY && scaleFactorY < 1) {
        wbCanvas.setWidth(optimalSize[0] * scaleFactorY);
        wbCanvas.setHeight(optimalSize[1] * scaleFactorY);
        wbCanvas.setZoom(scaleFactorY);
        setWhiteboardSize(optimalSize[0] * scaleFactorY, optimalSize[1] * scaleFactorY);
    } else {
        wbCanvas.setWidth(optimalSize[0]);
        wbCanvas.setHeight(optimalSize[1]);
        wbCanvas.setZoom(1);
        setWhiteboardSize(optimalSize[0], optimalSize[1]);
    }
    wbCanvas.calcOffset();
    wbCanvas.renderAll();
}

function setWhiteboardSize(w, h) {
    document.documentElement.style.setProperty('--wb-width', w);
    document.documentElement.style.setProperty('--wb-height', h);
}

function setWhiteboardBgColor(color) {
    let data = {
        peer_name: peer_name,
        action: 'bgcolor',
        color: color,
    };
    whiteboardAction(data);
}

function whiteboardIsDrawingMode(status) {
    wbCanvas.isDrawingMode = status;
    if (status) {
        setColor(whiteboardPencilBtn, 'green');
        setColor(whiteboardObjectBtn, 'white');
        setColor(whiteboardEraserBtn, 'white');
        wbIsEraser = false;
    } else {
        setColor(whiteboardPencilBtn, 'white');
        setColor(whiteboardObjectBtn, 'green');
    }
}

function whiteboardIsEraser(status) {
    whiteboardIsDrawingMode(false);
    wbIsEraser = status;
    setColor(whiteboardEraserBtn, wbIsEraser ? 'green' : 'white');
}

function whiteboardAddObj(type) {
    switch (type) {
        case 'imgUrl':
            Swal.fire({
                background: swalBackground,
                title: 'Image URL',
                input: 'text',
                showCancelButton: true,
                confirmButtonText: 'OK',
                showClass: {
                    popup: 'animate__animated animate__fadeInDown',
                },
                hideClass: {
                    popup: 'animate__animated animate__fadeOutUp',
                },
            }).then((result) => {
                if (result.isConfirmed) {
                    let wbCanvasImgURL = result.value;
                    if (isImageURL(wbCanvasImgURL)) {
                        fabric.Image.fromURL(wbCanvasImgURL, function (myImg) {
                            addWbCanvasObj(myImg);
                        });
                    } else {
                        userLog('error', 'The URL is not a valid image', 'top-end');
                    }
                }
            });
            break;
        case 'imgFile':
            Swal.fire({
                allowOutsideClick: false,
                background: swalBackground,
                position: 'center',
                title: 'Select the image',
                input: 'file',
                inputAttributes: {
                    accept: wbImageInput,
                    'aria-label': 'Select the image',
                },
                showDenyButton: true,
                confirmButtonText: `OK`,
                denyButtonText: `Cancel`,
                showClass: {
                    popup: 'animate__animated animate__fadeInDown',
                },
                hideClass: {
                    popup: 'animate__animated animate__fadeOutUp',
                },
            }).then((result) => {
                if (result.isConfirmed) {
                    let wbCanvasImg = result.value;
                    if (wbCanvasImg && wbCanvasImg.size > 0) {
                        let reader = new FileReader();
                        reader.onload = function (event) {
                            let imgObj = new Image();
                            imgObj.src = event.target.result;
                            imgObj.onload = function () {
                                let image = new fabric.Image(imgObj);
                                image.set({ top: 0, left: 0 }).scale(0.3);
                                addWbCanvasObj(image);
                            };
                        };
                        reader.readAsDataURL(wbCanvasImg);
                    } else {
                        userLog('error', 'File not selected or empty', 'top-end');
                    }
                }
            });
            break;
        case 'text':
            Swal.fire({
                background: swalBackground,
                title: 'Enter the text',
                input: 'text',
                showCancelButton: true,
                confirmButtonText: 'OK',
                showClass: {
                    popup: 'animate__animated animate__fadeInDown',
                },
                hideClass: {
                    popup: 'animate__animated animate__fadeOutUp',
                },
            }).then((result) => {
                if (result.isConfirmed) {
                    let wbCanvasText = result.value;
                    if (wbCanvasText) {
                        const text = new fabric.Text(wbCanvasText, {
                            top: 0,
                            left: 0,
                            fontFamily: 'Comfortaa',
                            fill: wbCanvas.freeDrawingBrush.color,
                            strokeWidth: wbCanvas.freeDrawingBrush.width,
                            stroke: wbCanvas.freeDrawingBrush.color,
                        });
                        addWbCanvasObj(text);
                    }
                }
            });
            break;
        case 'line':
            const line = new fabric.Line([50, 100, 200, 200], {
                top: 0,
                left: 0,
                fill: wbCanvas.freeDrawingBrush.color,
                strokeWidth: wbCanvas.freeDrawingBrush.width,
                stroke: wbCanvas.freeDrawingBrush.color,
            });
            addWbCanvasObj(line);
            break;
        case 'circle':
            const circle = new fabric.Circle({
                radius: 50,
                fill: 'transparent',
                stroke: wbCanvas.freeDrawingBrush.color,
                strokeWidth: wbCanvas.freeDrawingBrush.width,
            });
            addWbCanvasObj(circle);
            break;
        case 'rect':
            const rect = new fabric.Rect({
                top: 0,
                left: 0,
                width: 150,
                height: 100,
                fill: 'transparent',
                stroke: wbCanvas.freeDrawingBrush.color,
                strokeWidth: wbCanvas.freeDrawingBrush.width,
            });
            addWbCanvasObj(rect);
            break;
    }
}

function addWbCanvasObj(obj) {
    if (obj) {
        wbCanvas.add(obj);
        whiteboardIsDrawingMode(false);
        wbCanvasToJson();
    }
}

function setupWhiteboardLocalListners() {
    wbCanvas.on('mouse:down', function (e) {
        mouseDown(e);
    });
    wbCanvas.on('mouse:up', function () {
        mouseUp();
    });
    wbCanvas.on('mouse:move', function () {
        mouseMove();
    });
    wbCanvas.on('object:added', function () {
        objectAdded();
    });
}

function mouseDown(e) {
    wbIsDrawing = true;
    if (wbIsEraser && e.target) {
        wbCanvas.remove(e.target);
        return;
    }
}

function mouseUp() {
    wbIsDrawing = false;
    wbCanvasToJson();
}

function mouseMove() {
    if (wbIsEraser) {
        wbCanvas.hoverCursor = 'not-allowed';
        return;
    } else {
        wbCanvas.hoverCursor = 'move';
    }
    if (!wbIsDrawing) return;
}

function objectAdded() {
    if (!wbIsRedoing) wbPop = [];
    wbIsRedoing = false;
}

function wbCanvasBackgroundColor(color) {
    document.documentElement.style.setProperty('--wb-bg', color);
    wbBackgroundColorEl.value = color;
    wbCanvas.setBackgroundColor(color);
    wbCanvas.renderAll();
}

function wbCanvasUndo() {
    if (wbCanvas._objects.length > 0) {
        wbPop.push(wbCanvas._objects.pop());
        wbCanvas.renderAll();
    }
}

function wbCanvasRedo() {
    if (wbPop.length > 0) {
        wbIsRedoing = true;
        wbCanvas.add(wbPop.pop());
    }
}

function wbCanvasSaveImg() {
    const dataURL = wbCanvas.toDataURL({
        width: wbCanvas.getWidth(),
        height: wbCanvas.getHeight(),
        left: 0,
        top: 0,
        format: 'png',
    });
    const dataNow = getDataTimeString();
    const fileName = `whiteboard-${dataNow}.png`;
    saveDataToFile(dataURL, fileName);
}

function wbCanvasToJson() {
    if (rc.thereIsParticipants()) {
        let wbCanvasJson = JSON.stringify(wbCanvas.toJSON());
        rc.socket.emit('wbCanvasToJson', wbCanvasJson);
    }
}

function JsonToWbCanvas(json) {
    if (!wbIsOpen) toggleWhiteboard();

    wbCanvas.loadFromJSON(json);
    wbCanvas.renderAll();
}

function getWhiteboardAction(action) {
    return {
        peer_name: peer_name,
        action: action,
    };
}

function confirmClearBoard() {
    Swal.fire({
        background: swalBackground,
        imageUrl: image.delete,
        position: 'center',
        title: 'Clean the board',
        text: 'Are you sure you want to clean the board?',
        showDenyButton: true,
        confirmButtonText: `Yes`,
        denyButtonText: `No`,
        showClass: {
            popup: 'animate__animated animate__fadeInDown',
        },
        hideClass: {
            popup: 'animate__animated animate__fadeOutUp',
        },
    }).then((result) => {
        if (result.isConfirmed) {
            whiteboardAction(getWhiteboardAction('clear'));
            sound('delete');
        }
    });
}

function whiteboardAction(data, emit = true) {
    if (emit) {
        if (rc.thereIsParticipants()) {
            rc.socket.emit('whiteboardAction', data);
        }
    } else {
        userLog(
            'info',
            `${data.peer_name} <i class="fas fa-chalkboard-teacher"></i> whiteboard action: ${data.action}`,
            'top-end',
        );
    }

    switch (data.action) {
        case 'bgcolor':
            wbCanvasBackgroundColor(data.color);
            break;
        case 'undo':
            wbCanvasUndo();
            break;
        case 'redo':
            wbCanvasRedo();
            break;
        case 'clear':
            wbCanvas.clear();
            break;
        case 'close':
            if (wbIsOpen) toggleWhiteboard();
            break;
        //...
    }
}

// ####################################################
// HANDLE PARTICIPANTS
// ####################################################

function toggleParticipants() {
    let participants = rc.getId('participants');
    participants.classList.toggle('show');
    participants.style.top = '50%';
    participants.style.left = '50%';
    if (DetectRTC.isMobileDevice) {
        participants.style.width = '100%';
        participants.style.height = '100%';
    }
    isParticipantsListOpen = !isParticipantsListOpen;
}

async function getRoomParticipants(refresh = false) {
    let room_info = await rc.getRoomInfo();
    let peers = new Map(JSON.parse(room_info.peers));
    let table = await getParticipantsTable(peers);

    participantsCount = peers.size;
    roomParticipants.innerHTML = table;
    refreshParticipantsCount(participantsCount, false);

    if (!refresh) {
        toggleParticipants();
        sound('open');
    }

    setParticipantsTippy(peers);
}

async function getParticipantsTable(peers) {
    let table = `
    <div>
        <button
            id="inviteParticipants"
            onclick="shareRoom(true);"
        ><i class="fas fa-user-plus"></i>&nbsp; Invite Someone</button>
    </div>
    <div>
        <input
            id="searchParticipants"
            type="text"
            placeholder=" 🔍 Search participants ..."
            name="search"
            onkeyup="rc.searchPeer();"
        />
    </div>
    <table id="myTable">
    <tr>
        <th></th>
        <th></th>
        <th></th>
        <th></th>
        <th></th>
        <th></th>
        <th></th>
        <th></th>
        <th></th>
    </tr>`;

    if (!isRulesActive || isPresenter) {
        table += `
    <tr>
        <td>&nbsp;<i class="fas fa-users fa-lg"></i></td>
        <td>all</td>
        <td><button id="muteAllButton" onclick="rc.peerAction('me','${rc.peer_id}','mute',true,true)">${_PEER.audioOff}</button></td>
        <td><button id="hideAllButton" onclick="rc.peerAction('me','${rc.peer_id}','hide',true,true)">${_PEER.videoOff}</button></td>
        <td></td>
        <td><button id="sendAllButton" onclick="rc.selectFileToShare('${rc.peer_id}', true)">${_PEER.sendFile}</button></td>
        <td><button id="sendMessageToAll" onclick="rc.sendMessageTo('all','all')">${_PEER.sendMsg}</button></td>
        <td><button id="sendVideoToAll" onclick="rc.shareVideo('all');">${_PEER.sendVideo}</button></td>
        <td><button id="ejectAllButton" onclick="rc.peerAction('me','${rc.peer_id}','eject',true,true)">${_PEER.ejectPeer}</button></td>
    </tr>
    `;
    }

    for (let peer of Array.from(peers.keys())) {
        let peer_info = peers.get(peer).peer_info;
        let peer_name = peer_info.peer_name;
        let peer_audio = peer_info.peer_audio ? _PEER.audioOn : _PEER.audioOff;
        let peer_video = peer_info.peer_video ? _PEER.videoOn : _PEER.videoOff;
        let peer_hand = peer_info.peer_hand ? _PEER.raiseHand : _PEER.lowerHand;
        let peer_eject = _PEER.ejectPeer;
        let peer_sendFile = _PEER.sendFile;
        let peer_sendMsg = _PEER.sendMsg;
        let peer_id = peer_info.peer_id;
        let avatarImg = getParticipantAvatar(peer_name);
        if (rc.peer_id === peer_id) {
            table += `
            <tr id='${peer_name}'>
                <td><img src='${avatarImg}'></td>
                <td>${peer_name} (me)</td>
                <td><button>${peer_audio}</button></td>
                <td><button>${peer_video}</button></td>
                <td><button>${peer_hand}</button></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
            </tr>
            `;
        } else {
            if (isRulesActive && isPresenter) {
                table += `
                <tr id='${peer_id}'>
                    <td><img src='${avatarImg}'></td>
                    <td>${peer_name}</td>
                    <td><button id='${peer_id}___pAudio' onclick="rc.peerAction('me',this.id,'mute')">${peer_audio}</button></td>
                    <td><button id='${peer_id}___pVideo' onclick="rc.peerAction('me',this.id,'hide')">${peer_video}</button></td>
                    <td><button>${peer_hand}</button></td>
                    <td><button id='${peer_id}___shareFile' onclick="rc.selectFileToShare(this.id)">${peer_sendFile}</button></td>
                    <td><button id="${peer_id}___sendMessageTo" onclick="rc.sendMessageTo('${peer_id}','${peer_name}')">${peer_sendMsg}</button></td>
                    <td><button id="${peer_id}___sendVideoTo" onclick="rc.shareVideo('${peer_id}');">${_PEER.sendVideo}</button></td>
                    <td><button id='${peer_id}___pEject' onclick="rc.peerAction('me',this.id,'eject')">${peer_eject}</button></td>
                </tr>
                `;
            } else {
                table += `
                <tr id='${peer_id}'>
                    <td><img src='${avatarImg}'></td>
                    <td>${peer_name}</td>
                    <td><button id='${peer_id}___pAudio'>${peer_audio}</button></td>
                    <td><button id='${peer_id}___pVideo'>${peer_video}</button></td>
                    <td><button>${peer_hand}</button></td>
                    <td><button id='${peer_id}___shareFile' onclick="rc.selectFileToShare(this.id)">${peer_sendFile}</button></td>
                    <td><button id="${peer_id}___sendMessageTo" onclick="rc.sendMessageTo('${peer_id}','${peer_name}')">${peer_sendMsg}</button></td>
                    <td><button id="${peer_id}___sendVideoTo" onclick="rc.shareVideo('${peer_id}');">${_PEER.sendVideo}</button></td>
                    <td></td>
                </tr>
                `;
            }
        }
    }
    table += `</table>`;
    return table;
}

function setParticipantsTippy(peers) {
    //
    if (!DetectRTC.isMobileDevice) {
        setTippy('muteAllButton', 'Mute all participants', 'top');
        setTippy('hideAllButton', 'Hide all participants', 'top');
        setTippy('sendAllButton', 'Share file to all', 'top');
        setTippy('sendMessageToAll', 'Send message to all', 'top');
        setTippy('sendVideoToAll', 'Share video to all', 'top');
        setTippy('ejectAllButton', 'Eject all participants', 'top');
        //
        for (let peer of Array.from(peers.keys())) {
            let peer_info = peers.get(peer).peer_info;
            let peer_id = peer_info.peer_id;
            setTippy(peer_id + '___pAudio', 'Mute', 'top');
            setTippy(peer_id + '___pVideo', 'Hide', 'top');
            setTippy(peer_id + '___shareFile', 'Share file', 'top');
            setTippy(peer_id + '___sendMessageTo', 'Send private message', 'top');
            setTippy(peer_id + '___sendVideoTo', 'Share video', 'top');
            setTippy(peer_id + '___pEject', 'Eject', 'top');
        }
    }
}

function refreshParticipantsCount(count, adapt = true) {
    participantsTitle.innerHTML = `<i class="fas fa-users"></i> Participants ( ${count} )`;
    if (adapt) adaptAspectRatio(count);
}

function getParticipantAvatar(peerName) {
    return cfg.msgAvatar + '?name=' + peerName + '&size=32' + '&background=random&rounded=true';
}

// ####################################################
// SET THEME
// ####################################################

function setTheme(theme) {
    switch (theme) {
        case 'dark':
            swalBackground = 'radial-gradient(#393939, #000000)';
            document.documentElement.style.setProperty('--body-bg', 'radial-gradient(#393939, #000000)');
            document.documentElement.style.setProperty('--msger-bg', 'radial-gradient(#393939, #000000)');
            document.documentElement.style.setProperty('--settings-bg', 'radial-gradient(#393939, #000000)');
            document.documentElement.style.setProperty('--wb-bg', 'radial-gradient(#393939, #000000)');
            document.body.style.background = 'radial-gradient(#393939, #000000)';
            break;
        case 'grey':
            swalBackground = 'radial-gradient(#666, #333)';
            document.documentElement.style.setProperty('--body-bg', 'radial-gradient(#666, #333)');
            document.documentElement.style.setProperty('--msger-bg', 'radial-gradient(#666, #333)');
            document.documentElement.style.setProperty('--settings-bg', 'radial-gradient(#666, #333)');
            document.documentElement.style.setProperty('--wb-bg', 'radial-gradient(#797979, #000)');
            document.body.style.background = 'radial-gradient(#666, #333)';
            break;
        //...
    }
    currentTheme = theme;
    wbIsBgTransparent = false;
    rc.isChatBgTransparent = false;
}

// ####################################################
// HANDLE ASPECT RATIO
// ####################################################

function handleAspectRatio() {
    if (participantsCount > 1) {
        adaptAspectRatio(videoMediaContainer.childElementCount);
    } else {
        resizeVideoMedia();
    }
}

function adaptAspectRatio(participantsCount) {
    /* 
        ['0:0', '4:3', '16:9', '1:1', '1:2'];
    */
    let desktop,
        mobile = 1;
    // desktop aspect ratio
    switch (participantsCount) {
        case 1:
        case 3:
        case 4:
        case 7:
        case 9:
            desktop = 2; // (16:9)
            break;
        case 5:
        case 6:
        case 10:
        case 11:
            desktop = 1; // (4:3)
            break;
        case 2:
        case 8:
            desktop = 3; // (1:1)
            break;
        default:
            desktop = 0; // (0:0)
    }
    // mobile aspect ratio
    switch (participantsCount) {
        case 3:
        case 9:
        case 10:
            mobile = 2; // (16:9)
            break;
        case 2:
        case 7:
        case 8:
        case 11:
            mobile = 1; // (4:3)
            break;
        case 1:
        case 4:
        case 5:
        case 6:
            mobile = 3; // (1:1)
            break;
        default:
            mobile = 3; // (1:1)
    }
    if (participantsCount > 11) {
        desktop = 1; // (4:3)
        mobile = 3; // (1:1)
    }
    BtnsAspectRatio.selectedIndex = DetectRTC.isMobileDevice ? mobile : desktop;
    setAspectRatio(BtnsAspectRatio.selectedIndex);
}

// ####################################################
// ABOUT
// ####################################################

function showAbout() {
    sound('open');

    Swal.fire({
        background: swalBackground,
        imageUrl: swalImageUrl,
        imageWidth: 300,
        imageHeight: 150,
        position: 'center',
        html: `
        <br/>
        <div id="about">
            <b><a href="https://github.com/miroslavpejic85/mirotalksfu" class="umami--click--github" target="_blank">Open Source</a></b> project
            <br/><br />
            <button class="pulsate umami--click--sponsors" onclick="window.open('https://github.com/sponsors/miroslavpejic85?o=esb')"><i class="fas fa-heart"></i> Support</button>
            <br /><br />
            Contact: <a href="https://www.linkedin.com/in/miroslav-pejic-976a07101/" class="umami--click--linkedin" target="_blank"> Miroslav Pejic</a>
        </div>
        `,
        showClass: {
            popup: 'animate__animated animate__fadeInUp',
        },
        hideClass: {
            popup: 'animate__animated animate__fadeOutUp',
        },
    });
}
// ####################################################
// Translate
// ####################################################

let isTranslationActive = false;
const captionArea = document.getElementById('captionArea');
const translatedTextElement = document.getElementById('translatedText');

function enableTranslateText() {
    isTranslationActive = !isTranslationActive; // Toggle the state

    if (isTranslationActive) {
        captionArea.style.display = 'block';
        // Potentially fetch and display an initial message like "Translation Active"
        translatedTextElement.textContent = "Translation Active...";
    } else {
        captionArea.style.display = 'none';
        translatedTextElement.textContent = ""; // Clear the text
    }

    // You'll also need to initiate or stop the actual translation process here
    // (e.g., connecting to a WebSocket, starting an API call, etc.)
}

// Example: Assuming your "Translate Text" button has an ID of "translateButton"
const translateButton = document.getElementById('translateButton');
if (translateButton) {
    translateButton.addEventListener('click', enableTranslateText);
}

function updateTranslatedText(text) {
    translatedTextElement.textContent = text;
}

