// ============================================================
//  sketch.js  — CPR Hero App
//  Logic is identical to original. Only removed references to
//  image-based elements that no longer exist in the new HTML.
// ============================================================

let genderState = null;   // 1 = Raja, 0 = Rani
let mic;
let listeningForResponse = false;
let responseTimeout = null;
let breath_no;
let dialedNumber = '';
let t1, t2, t3, t4, t5, t6;
let canvas;
let canvasActive = false;
let count = 0;
let currentState = "blank";
let compression_count = 0;
let now, interval;
let lastTouchTime = 0;

// play screen
let cheekOpacity = 40;
let lipOpacity = 120;
let play_start_time, play_elapsed = 0;

// blood fill
let goodfillRate = 100;
let badfillRate = 50;
let progress = 0;

// bpm meter
let angle = 0;
let bpm = 0;
let numberToDisplay;
let decayRate = 10;
let decay_normal = 90;

// compressions
let maxTotalCompressions = 0;
let task_time;
let timeleft;
let good_compression = 0;
let diffGoal = 0;
let fastcount = 0;
let slowcount = 0;

// inactivity tracking
let pressed_time = 0;
let lastTouchElapsed = 0;

let breathc = 0;
let couldobserveb;

// p5 assets
let playimg, heartimg, meterimg, arrowimg;

function preload() {
  playimg   = loadImage("eyes+ (2).png");
  heartimg  = loadImage("heart.png");
  meterimg  = loadImage("bpm meter86.png");
  arrowimg  = loadImage("arrow2.png");

  respondedaud     = loadSound("ElevenLabs_2025-06-I am .mp3");
  respondednextaud = loadSound("ElevenLabs_2025-06-16T10_02_51_Alice_pre_sp100_s50_sb75_v3.mp3");
  promisertaud     = loadSound("ElevenLabs_2025-11-04T11_56_30_Alice_pre_sp100_s50_sb75_v3.mp3");

  gasp_aud         = loadSound("gasping.m4a");
  normal_breath_aud= loadSound("breathing-6811.mp3");
  couldobserveb    = loadSound("could_you_see_breathing.mp3");
  ifbreathnormalaud= loadSound("ElevenLabs_2025-06-17T23_01_53_Alice_pre_sp100_s50_sb75_v3.mp3");
  promisebtaud     = loadSound("ElevenLabs_2025-11-04T11_55_06_Alice_pre_sp100_s50_sb75_v3.mp3");

  ring         = loadSound("mixkit-office-telephone-ring-1350.wav");
  dial         = loadSound("9aud.mp3");
  addspeakeraud= loadSound("ElevenLabs_2025-11-04T12_00_41_Alice_pre_sp100_s50_sb75_v3.mp3");
  victimaud    = loadSound("ElevenLabs_2025-11-04T17_32_18_Alice_pre_sp100_s50_sb75_v3.mp3");

  cprC1aud  = loadSound("ElevenLabs_2025-06-28T05_17_33_Alice_pre_sp100_s50_sb75_v3.mp3");
  cprC2aud  = loadSound("ElevenLabs_2025-06-25T03_15_33_Alice_pre_sp100_s50_sb75_v3.mp3");
  cprC3aud  = loadSound("ElevenLabs_2025-06-16T00_04_57_Alice_pre_sp100_s50_sb75_v3.mp3");
  cprC4aud  = loadSound("ElevenLabs_2025-06-25T03_12_37_Alice_pre_sp100_s50_sb75_v3.mp3");
  cprBeginaud = loadSound("ElevenLabs_2025-11-05T03_21_18_Alice_pre_sp100_s50_sb75_v3.mp3");

  press_music = loadSound("mixkit-message-pop-alert-2354.mp3");
  winaud      = loadSound("mixkit-fairy-arcade-sparkle-866.wav");
  aedaud      = loadSound("ElevenLabs_2025-06-16T12_58_21_Alice_pre_sp100_s50_sb75_v3.mp3");
  ambaud      = loadSound("ambulance-312230.mp3");
  lateaud     = loadSound("negative_beeps-6008.mp3");

  promisewtaud  = loadSound("ElevenLabs_2025-11-05T06_53_28_Alice_pre_sp100_s50_sb75_v3.mp3");
  promiseiltaud = loadSound("ElevenLabs_2025-12-10T02_39_25_Alice_pre_sp100_s50_sb75_v3.mp3");
  promisefltaud = loadSound("ElevenLabs_2025-12-10T02_40_37_Alice_pre_sp100_s50_sb75_v3.mp3");
  promisesltaud = loadSound("ElevenLabs_2025-12-10T02_41_38_Alice_pre_sp100_s50_sb75_v3.mp3");
}

function setup() {
  breath_no = floor(random(11));
  console.log(breath_no);
  maxTotalCompressions = floor(random(30, 50));
  task_time = 600 * maxTotalCompressions + 3000;
  mic = new p5.AudioIn();
  mic.start();
  imageMode(CENTER);
}

// ============================================================
//  MAIN WINDOW.ONLOAD — all button wiring
// ============================================================
window.onload = () => {

  // --- Screen elements ---
  const begin1          = document.getElementById("begin1");
  const gender          = document.getElementById("gender");
  const intro           = document.getElementById("intro");
  const checkdanger     = document.getElementById("checkdanger");
  checkresponse         = document.getElementById("checkresponse");
  checkresponseq        = document.getElementById("checkresponseq");
  checkbreathing        = document.getElementById("checkbreathing");
  awake                 = document.getElementById("awake");
  checkbreathingq       = document.getElementById("checkbreathingq");
  checkbreathingtypeq   = document.getElementById("checkbreathingtypeq");
  normalbreathing       = document.getElementById("normalbreathing");
  dnotsafeq             = document.getElementById("dnotsafeq");
  dcantsafe             = document.getElementById("dcantsafe");
  promisedraja          = document.getElementById("promisedraja");
  promisedrajapress     = document.getElementById("promisedrajapress");
  promisesealedraja     = document.getElementById("promisesealedraja");
  promisedrani          = document.getElementById("promisedrani");
  promisedranipress     = document.getElementById("promisedranipress");
  promisesealedrani     = document.getElementById("promisesealedrani");
  responded             = document.getElementById("responded");
  promiserrani          = document.getElementById("promiserrani");
  promiserranipress     = document.getElementById("promiserranipress");
  promiserraja          = document.getElementById("promiserraja");
  promiserrajapress     = document.getElementById("promiserrajapress");
  promisebraja          = document.getElementById("promisebraja");
  promisebrajapress     = document.getElementById("promisebrajapress");
  promisebrani          = document.getElementById("promisebrani");
  promisebranipress     = document.getElementById("promisebranipress");
  requestaed            = document.getElementById("requestaed");
  dial112blank          = document.getElementById("dial112blank");
  dial112               = document.getElementById("dial112");
  addspeaker            = document.getElementById("addspeaker");
  addedspeaker          = document.getElementById("addedspeaker");
  victiminca            = document.getElementById("victiminca");
  cpr1                  = document.getElementById("cpr1");
  cpr2                  = document.getElementById("cpr2");
  cpr3                  = document.getElementById("cpr3");
  cpr4                  = document.getElementById("cpr4");
  cpr5                  = document.getElementById("cpr5");
  p5Screen              = document.getElementById("p5Screen");
  win                   = document.getElementById("win");
  promisewraja          = document.getElementById("promisewraja");
  promisewrajapress     = document.getElementById("promisewrajapress");
  promisewrani          = document.getElementById("promisewrani");
  promisewranipress     = document.getElementById("promisewranipress");
  latefast              = document.getElementById("latefast");
  lateslow              = document.getElementById("lateslow");
  lateinactive          = document.getElementById("lateinactive");
  aed                   = document.getElementById("aed");
  promiseaedraja        = document.getElementById("promiseaedraja");
  promiseaedrajapress   = document.getElementById("promiseaedrajapress");
  promiseaedrani        = document.getElementById("promiseaedrani");
  promiseaedranipress   = document.getElementById("promiseaedranipress");
  amb                   = document.getElementById("amb");
  promiseambraja        = document.getElementById("promiseambraja");
  promiseambrajapress   = document.getElementById("promiseambrajapress");
  promiseambrani        = document.getElementById("promiseambrani");
  promiseambranipress   = document.getElementById("promiseambranipress");
  promiselateinactiveraja      = document.getElementById("promiselateinactiveraja");
  promiselateinactiverajapress = document.getElementById("promiselateinactiverajapress");
  promiselateinactiverani      = document.getElementById("promiselateinactiverani");
  promiselateinactiveranipress = document.getElementById("promiselateinactiveranipress");
  promiselatefastraja          = document.getElementById("promiselatefastraja");
  promiselatefastrajapress     = document.getElementById("promiselatefastrajapress");
  promiselatefastrani          = document.getElementById("promiselatefastrani");
  promiselatefastranipress     = document.getElementById("promiselatefastranipress");
  promiselateslowraja          = document.getElementById("promiselateslowraja");
  promiselateslowrajapress     = document.getElementById("promiselateslowrajapress");
  promiselateslowrani          = document.getElementById("promiselateslowrani");
  promiselateslowranipress     = document.getElementById("promiselateslowranipress");

  // --- Button elements ---
  const beginBtn         = document.getElementById("beginBtn");
  const beginBubBtn      = document.getElementById("beginBubBtn");
  const rajaBtn          = document.getElementById("rajaBtn");
  const raniBtn          = document.getElementById("raniBtn");
  const startBtn         = document.getElementById("startBtn");
  const dyesBtn          = document.getElementById("dyesBtn");
  const dnoBtn           = document.getElementById("dnoBtn");
  const ryesBtn          = document.getElementById("ryesBtn");
  const rnoBtn           = document.getElementById("rnoBtn");
  const byesBtn          = document.getElementById("byesBtn");
  const bnoBtn           = document.getElementById("bnoBtn");
  const normalBtn        = document.getElementById("normalBtn");
  const abnormalBtn      = document.getElementById("abnormalBtn");
  const nowsafeBtn       = document.getElementById("nowsafeBtn");
  const cantsafeBtn      = document.getElementById("cantsafeBtn");
  const nextpBtn         = document.getElementById("nextpBtn");
  const dpromisepress    = document.getElementById("dpromisepress");
  const dranipromisepress= document.getElementById("dranipromisepress");
  const rranipromisepress= document.getElementById("rranipromisepress");
  const rrajapromisepress= document.getElementById("rrajapromisepress");
  const nextBtn          = document.getElementById("nextBtn");
  const nextprBtn        = document.getElementById("nextprBtn");
  const nextvBtn         = document.getElementById("nextvBtn");
  const branipromisepress= document.getElementById("branipromisepress");
  const bpromisepress    = document.getElementById("bpromisepress");
  const nextaBtn         = document.getElementById("nextaBtn");
  const callBtn          = document.getElementById("callBtn");
  const speakerbtn       = document.getElementById("speakerbtn");
  const nextc1           = document.getElementById("nextc1");
  const nextc2           = document.getElementById("nextc2");
  const nextc3           = document.getElementById("nextc3");
  const nextc4           = document.getElementById("nextc4");
  const startcpr         = document.getElementById("startcpr");
  const nextwinBtn       = document.getElementById("nextwinBtn");
  const nextaedBtn       = document.getElementById("nextaedBtn");
  const nextambBtn       = document.getElementById("nextambBtn");
  const nextlateinactiveBtn = document.getElementById("nextlateinactiveBtn");
  const nextlateslowBtn     = document.getElementById("nextlateslowBtn");
  const nextlatefastBtn     = document.getElementById("nextlatefastBtn");
  const practiceagainbtnraja= document.getElementById("practiceagainbtnraja");
  const practiceagainbtnrani= document.getElementById("practiceagainbtnrani");
  const wpromisepress       = document.getElementById("wpromisepress");
  const wranipromisepress   = document.getElementById("wranipromisepress");

  // ============================================================
  //  DIAL PAD LOGIC
  // ============================================================
  const dialDisplay  = document.getElementById("dialDisplay");
  const dialBtn0     = document.getElementById("dialBtn0");
  const dialBtn1     = document.getElementById("dialBtn1");
  const dialBtn2     = document.getElementById("dialBtn2");
  const dialBtn3     = document.getElementById("dialBtn3");
  const dialBtn4     = document.getElementById("dialBtn4");
  const dialBtn5     = document.getElementById("dialBtn5");
  const dialBtn6     = document.getElementById("dialBtn6");
  const dialBtn7     = document.getElementById("dialBtn7");
  const dialBtn8     = document.getElementById("dialBtn8");
  const dialBtn9     = document.getElementById("dialBtn9");
  const deleteBtnDial= document.getElementById("deleteBtnDial");

  const checkCallButtonState = () => {
    if (dialedNumber === "995") {
      callBtn.disabled = false;
      callBtn.style.opacity = 1.0;
    } else {
      callBtn.disabled = true;
      callBtn.style.opacity = 0.5;
    }
  };

  const addDigit = (digit) => {
    dial.play();
    if (dialedNumber.length < 3) {
      dialedNumber += digit;
      dialDisplay.textContent = dialedNumber;
      dialDisplay.classList.remove("empty");
      checkCallButtonState();
    }
  };

  const deleteDigit = (e) => {
    if (e) e.preventDefault();
    dialedNumber = dialedNumber.slice(0, -1);
    if (dialedNumber.length === 0) {
      dialDisplay.textContent = "995";
      dialDisplay.classList.add("empty");
    } else {
      dialDisplay.textContent = dialedNumber;
    }
    checkCallButtonState();
  };

  const setupDialButton = (btnElement, digit) => {
    if (!btnElement) return;
    const handler = (e) => { if (e) e.preventDefault(); addDigit(digit); };
    btnElement.addEventListener('click', handler);
    btnElement.addEventListener('touchstart', handler);
  };

  setupDialButton(dialBtn0, '0');
  setupDialButton(dialBtn1, '1');
  setupDialButton(dialBtn2, '2');
  setupDialButton(dialBtn3, '3');
  setupDialButton(dialBtn4, '4');
  setupDialButton(dialBtn5, '5');
  setupDialButton(dialBtn6, '6');
  setupDialButton(dialBtn7, '7');
  setupDialButton(dialBtn8, '8');
  setupDialButton(dialBtn9, '9');

  deleteBtnDial.addEventListener('click', deleteDigit);
  deleteBtnDial.addEventListener('touchstart', deleteDigit);

  checkCallButtonState();
  dialDisplay.textContent = "995";
  dialDisplay.classList.add("empty");

  // ============================================================
  //  P5 CANVAS HELPERS
  // ============================================================
  function startCanvas() {
    if (!canvasActive) {
      canvas = createCanvas(windowWidth, windowHeight);
      canvas.parent("p5Screen");
      canvasActive = true;
    }
  }

  function removeCanvas() {
    if (canvasActive) {
      canvas.remove();
      canvasActive = false;
    }
  }

  // ============================================================
  //  BUTTON HANDLERS
  // ============================================================

  // Begin
  const handleBegin = () => {
    userStartAudio();
    begin1.style.display = "none";
    gender.style.display = "flex";
  };
  beginBtn.onclick = handleBegin;
  beginBtn.addEventListener('touchstart', handleBegin);

  // Skip to play (bubble shortcut on intro screen)
  const handleBubbleShortcut = () => {
    userStartAudio();
    [t1, t2, t3, t4, t5, t6].forEach(t => clearTimeout(t));
    begin1.style.display = "none";
    intro.style.display = "none";
    cpr4.style.display = "none";
    cpr5.style.display = "flex";
    introAudio.pause();
    introAudio.currentTime = 0;
    cprC4aud.stop();
    cprBeginaud.play();
  };
  beginBubBtn.onclick = handleBubbleShortcut;
  beginBubBtn.addEventListener('touchstart', handleBubbleShortcut);

  // Raja
  const handleRaja = () => {
    genderState = 1;
    introAudio.play();
    gender.style.display = "none";
    intro.style.display = "flex";
  };
  rajaBtn.onclick = handleRaja;
  rajaBtn.addEventListener('touchstart', handleRaja);

  // Rani
  const handleRani = () => {
    genderState = 0;
    introAudio.play();
    gender.style.display = "none";
    intro.style.display = "flex";
  };
  raniBtn.onclick = handleRani;
  raniBtn.addEventListener('touchstart', handleRani);

  // Start
  const handleStart = () => {
    intro.style.display = "none";
    checkdanger.style.display = "flex";
    introAudio.pause();
    introAudio.currentTime = 0;
    checkdAudio.play();
  };
  startBtn.onclick = handleStart;
  startBtn.addEventListener('touchstart', handleStart);

  // Danger Yes
  const handleDyes = () => {
    checkdAudio.pause();
    checkdAudio.currentTime = 0;
    checkrAudio.play();
    checkdanger.style.display = "none";
    checkresponse.style.display = "flex";
    listeningForResponse = true;
    responseTimeout = setTimeout(() => {
      listeningForResponse = false;
      checkresponse.style.display = "none";
      checkresponseq.style.display = "flex";
      checkrAudio.pause();
      checkrAudio.currentTime = 0;
      did_spongy_respond.play();
    }, 8000);
  };
  dyesBtn.onclick = handleDyes;
  dyesBtn.addEventListener('touchstart', handleDyes);

  // Danger No
  const handleDno = () => {
    checkdAudio.pause();
    checkdAudio.currentTime = 0;
    dnotsafeAudio.play();
    checkdanger.style.display = "none";
    dnotsafeq.style.display = "flex";
  };
  dnoBtn.onclick = handleDno;
  dnoBtn.addEventListener('touchstart', handleDno);

  // Now Safe
  const handleNowSafe = () => {
    dnotsafeAudio.pause();
    dnotsafeAudio.currentTime = 0;
    checkrAudio.play();
    dnotsafeq.style.display = "none";
    checkresponse.style.display = "flex";
    listeningForResponse = true;
    responseTimeout = setTimeout(() => {
      listeningForResponse = false;
      checkresponse.style.display = "none";
      checkresponseq.style.display = "flex";
      did_spongy_respond.play();
    }, 8000);
  };
  nowsafeBtn.onclick = handleNowSafe;
  nowsafeBtn.addEventListener('touchstart', handleNowSafe);

  // Can't Safe
  const handleCantSafe = () => {
    dnotsafeAudio.pause();
    dnotsafeAudio.currentTime = 0;
    cantdsafe.play();
    dnotsafeq.style.display = "none";
    dcantsafe.style.display = "flex";
  };
  cantsafeBtn.onclick = handleCantSafe;
  cantsafeBtn.addEventListener('touchstart', handleCantSafe);

  // Next P (dcantsafe)
  const handleNextP = () => {
    cantdsafe.pause();
    cantdsafe.currentTime = 0;
    promisedaud.play();
    dcantsafe.style.display = "none";
    if (genderState === 1) {
      promisedraja.style.display = "flex";
      setTimeout(() => { promisedraja.style.display = "none"; promisedrajapress.style.display = "flex"; }, 2000);
    } else {
      promisedrani.style.display = "flex";
      setTimeout(() => { promisedrani.style.display = "none"; promisedranipress.style.display = "flex"; }, 2000);
    }
  };
  nextpBtn.onclick = handleNextP;
  nextpBtn.addEventListener('touchstart', handleNextP);

  // Promise press — Danger Raja
  const handleDPromisePress = () => {
    promisedaud.pause(); promisedaud.currentTime = 0;
    promisejingle.play(); test.play();
    promisedrajapress.style.display = "none";
    promisesealedraja.style.display = "flex";
  };
  dpromisepress.onclick = handleDPromisePress;
  dpromisepress.addEventListener('touchstart', handleDPromisePress);

  // Promise press — Danger Rani
  const handleDRaniPromisePress = () => {
    promisedaud.pause(); promisedaud.currentTime = 0;
    promisejingle.play(); test.play();
    promisedranipress.style.display = "none";
    promisesealedrani.style.display = "flex";
  };
  dranipromisepress.onclick = handleDRaniPromisePress;
  dranipromisepress.addEventListener('touchstart', handleDRaniPromisePress);

  // Next (awake screen)
  const handleNext = () => {
    respondednextaud.play();
    awake.style.display = "none";
    responded.style.display = "flex";
  };
  nextBtn.onclick = handleNext;
  nextBtn.addEventListener('touchstart', handleNext);

  // Next PR (responded)
  const handleNextPR = () => {
    responded.style.display = "none";
    promisertaud.play();
    respondednextaud.stop();
    if (genderState === 1) {
      promiserraja.style.display = "flex";
      setTimeout(() => { promiserraja.style.display = "none"; promiserrajapress.style.display = "flex"; }, 2000);
    } else {
      promiserrani.style.display = "flex";
      setTimeout(() => { promiserrani.style.display = "none"; promiserranipress.style.display = "flex"; }, 2000);
    }
  };
  nextprBtn.onclick = handleNextPR;
  nextprBtn.addEventListener('touchstart', handleNextPR);

  // Promise press — Response Rani
  const handleRRaniPromisePress = () => {
    promisejingle.play(); test.play(); promisertaud.stop();
    promiserranipress.style.display = "none";
    promisesealedrani.style.display = "flex";
  };
  rranipromisepress.onclick = handleRRaniPromisePress;
  rranipromisepress.addEventListener('touchstart', handleRRaniPromisePress);

  // Promise press — Response Raja
  const handleRRajaPromisePress = () => {
    promisejingle.play(); test.play(); promisertaud.stop();
    promiserrajapress.style.display = "none";
    promisesealedraja.style.display = "flex";
  };
  rrajapromisepress.onclick = handleRRajaPromisePress;
  rrajapromisepress.addEventListener('touchstart', handleRRajaPromisePress);

  // Response No
  const handleRno = () => {
    userStartAudio();
    did_spongy_respond.pause(); did_spongy_respond.currentTime = 0;
    check_if_breathing.play();
    checkresponseq.style.display = "none";
    awake.style.display = "none";
    checkbreathing.style.display = "flex";
    if (breath_no % 3 === 0) { gasp_aud.play(); }
    else if (breath_no % 5 === 0) { normal_breath_aud.play(); }
    setTimeout(() => {
      checkbreathing.style.display = "none";
      checkbreathingq.style.display = "flex";
      couldobserveb.play();
      gasp_aud.stop();
      normal_breath_aud.stop();
    }, 10000);
  };
  rnoBtn.onclick = handleRno;
  rnoBtn.addEventListener('touchstart', handleRno);

  // Breathing No
  const handleBno = () => {
    requestaedaud.play();
    checkbreathingq.style.display = "none";
    requestaed.style.display = "flex";
  };
  bnoBtn.onclick = handleBno;
  bnoBtn.addEventListener('touchstart', handleBno);

  // Breathing Yes
  const handleByes = () => {
    breathingtype.play();
    could_you_see_breathing.pause(); could_you_see_breathing.currentTime = 0;
    checkbreathingq.style.display = "none";
    checkbreathingtypeq.style.display = "flex";
  };
  byesBtn.onclick = handleByes;
  byesBtn.addEventListener('touchstart', handleByes);

  // Normal breathing
  const handleNormal = () => {
    breathingtype.pause(); breathingtype.currentTime = 0;
    ifbreathnormalaud.play();
    checkbreathingtypeq.style.display = "none";
    normalbreathing.style.display = "flex";
  };
  normalBtn.onclick = handleNormal;
  normalBtn.addEventListener('touchstart', handleNormal);

  // Abnormal breathing
  const handleAbnormal = () => {
    breathingtype.pause(); breathingtype.currentTime = 0;
    requestaedaud.play();
    checkbreathingtypeq.style.display = "none";
    requestaed.style.display = "flex";
  };
  abnormalBtn.onclick = handleAbnormal;
  abnormalBtn.addEventListener('touchstart', handleAbnormal);

  // Next V (normalbreathing)
  const handleNextV = () => {
    ifbreathnormalaud.stop();
    promisebtaud.play();
    normalbreathing.style.display = "none";
    if (genderState === 1) {
      promisebraja.style.display = "flex";
      setTimeout(() => { promisebraja.style.display = "none"; promisebrajapress.style.display = "flex"; }, 2000);
    } else {
      promisebrani.style.display = "flex";
      setTimeout(() => { promisebrani.style.display = "none"; promisebranipress.style.display = "flex"; }, 2000);
    }
  };
  nextvBtn.onclick = handleNextV;
  nextvBtn.addEventListener('touchstart', handleNextV);

  // Promise press — Breathing Rani
  const handleBRaniPromisePress = () => {
    promisebtaud.stop(); promisejingle.play(); test.play();
    promisebranipress.style.display = "none";
    promisesealedrani.style.display = "flex";
  };
  branipromisepress.onclick = handleBRaniPromisePress;
  branipromisepress.addEventListener('touchstart', handleBRaniPromisePress);

  // Promise press — Breathing Raja
  const handleBrajaPromisePress = () => {
    promisejingle.play(); test.play(); promisebtaud.stop();
    promisebrajapress.style.display = "none";
    promisesealedraja.style.display = "flex";
  };
  bpromisepress.onclick = handleBrajaPromisePress;
  bpromisepress.addEventListener('touchstart', handleBrajaPromisePress);

  // Next A (requestaed)
  const handleNextA = () => {
    call112.play();
    requestaedaud.pause(); requestaedaud.currentTime = 0;
    requestaed.style.display = "none";
    dial112.style.display = "flex";
  };
  nextaBtn.onclick = handleNextA;
  nextaBtn.addEventListener('touchstart', handleNextA);

  // Call button
  const handleCall = () => {
    if (callBtn.disabled) return;
    call112.pause(); call112.currentTime = 0;
    ring.play();
    addspeakeraud.play();
    dial112.style.display = "none";
    addspeaker.style.display = "flex";
  };
  callBtn.onclick = handleCall;
  callBtn.addEventListener('touchstart', handleCall);

  // Speaker button
  const handleSpeaker = () => {
    call112.pause(); call112.currentTime = 0;
    addspeaker.style.display = "none";
    addedspeaker.style.display = "flex";

    t1 = setTimeout(() => {
      addedspeaker.style.display = "none";
      victiminca.style.display = "flex";
      victimaud.play();
      addspeakeraud.stop();

      t2 = setTimeout(() => {
        victiminca.style.display = "none";
        cpr1.style.display = "flex";
        cprC1aud.play();

        t3 = setTimeout(() => {
          cpr1.style.display = "none";
          cpr2.style.display = "flex";
          cprC2aud.play(); cprC1aud.stop();

          t4 = setTimeout(() => {
            cpr2.style.display = "none";
            cpr3.style.display = "flex";
            cprC3aud.play(); cprC2aud.stop();

            t5 = setTimeout(() => {
              cpr3.style.display = "none";
              cpr4.style.display = "flex";
              cprC4aud.play(); cprC3aud.stop();

              t6 = setTimeout(() => {
                cpr4.style.display = "none";
                cpr5.style.display = "flex";
                cprBeginaud.play(); cprC4aud.stop();
              }, 8000);
            }, 8000);
          }, 8000);
        }, 8000);
      }, 8000);
    }, 10000);
  };
  speakerbtn.onclick = handleSpeaker;
  speakerbtn.addEventListener('touchstart', handleSpeaker);

  // Stop all CPR audio + timers
  const stopAllCPRAudio = () => {
    victimaud.stop(); addspeakeraud.stop();
    cprC1aud.stop(); cprC2aud.stop(); cprC3aud.stop(); cprC4aud.stop();
    [t1, t2, t3, t4, t5, t6].forEach(t => clearTimeout(t));
  };

  // CPR next buttons
  const handleNextC1 = () => { stopAllCPRAudio(); cprC2aud.play(); cpr1.style.display = "none"; cpr2.style.display = "flex"; };
  nextc1.onclick = handleNextC1; nextc1.addEventListener('touchstart', handleNextC1);

  const handleNextC2 = () => { stopAllCPRAudio(); cprC3aud.play(); cpr2.style.display = "none"; cpr3.style.display = "flex"; };
  nextc2.onclick = handleNextC2; nextc2.addEventListener('touchstart', handleNextC2);

  const handleNextC3 = () => { stopAllCPRAudio(); cprC4aud.play(); cpr3.style.display = "none"; cpr4.style.display = "flex"; };
  nextc3.onclick = handleNextC3; nextc3.addEventListener('touchstart', handleNextC3);

  const handleNextC4 = () => { stopAllCPRAudio(); cprBeginaud.play(); cpr4.style.display = "none"; cpr5.style.display = "flex"; };
  nextc4.onclick = handleNextC4; nextc4.addEventListener('touchstart', handleNextC4);

  // Start CPR → p5 screen
  const handleStartCPR = () => {
    [t1, t2, t3, t4, t5].forEach(t => clearTimeout(t));
    cpr5.style.display = "none";
    p5Screen.style.display = "flex";
    startCanvas();
    currentState = "play";
    play_start_time = millis();
  };
  startcpr.onclick = handleStartCPR;
  startcpr.addEventListener('touchstart', handleStartCPR);

  // Win screen
  const handleNextWin = () => {
    win.style.display = "none";
    promisewtaud.play();
    if (genderState === 1) {
      promisewraja.style.display = "flex";
      setTimeout(() => { promisewraja.style.display = "none"; promisewrajapress.style.display = "flex"; }, 2000);
    } else {
      promisewrani.style.display = "flex";
      setTimeout(() => { promisewrani.style.display = "none"; promisewranipress.style.display = "flex"; }, 2000);
    }
  };
  nextwinBtn.onclick = handleNextWin;
  nextwinBtn.addEventListener('touchstart', handleNextWin);

  const handleWRaniPromisePress = () => {
    promisewtaud.stop(); promisejingle.play(); test.play();
    promisewranipress.style.display = "none";
    promisesealedrani.style.display = "flex";
  };
  wranipromisepress.onclick = handleWRaniPromisePress;
  wranipromisepress.addEventListener('touchstart', handleWRaniPromisePress);

  const handleWPromisePress = () => {
    promisewtaud.stop(); promisejingle.play(); test.play();
    promisewrajapress.style.display = "none";
    promisesealedraja.style.display = "flex";
  };
  wpromisepress.onclick = handleWPromisePress;
  wpromisepress.addEventListener('touchstart', handleWPromisePress);

  // Practice again
  const handlePracticeAgainRaja = () => {
    promisesealedraja.style.display = "none";
    begin1.style.display = "flex";
    reset();
    dialDisplay.textContent = "995";
    dialDisplay.classList.add("empty");
    callBtn.disabled = true;
    callBtn.style.opacity = 0.5;
  };
  practiceagainbtnraja.onclick = handlePracticeAgainRaja;
  practiceagainbtnraja.addEventListener('touchstart', handlePracticeAgainRaja);

  const handlePracticeAgainRani = () => {
    promisesealedrani.style.display = "none";
    begin1.style.display = "flex";
    reset();
    dialDisplay.textContent = "995";
    dialDisplay.classList.add("empty");
    callBtn.disabled = true;
    callBtn.style.opacity = 0.5;
  };
  practiceagainbtnrani.onclick = handlePracticeAgainRani;
  practiceagainbtnrani.addEventListener('touchstart', handlePracticeAgainRani);

  // Ambulance screen
  const handleNextAmb = () => {
    promisewtaud.play();
    amb.style.display = "none";
    if (genderState === 1) {
      promiseambraja.style.display = "flex";
      setTimeout(() => { promiseambraja.style.display = "none"; promiseambrajapress.style.display = "flex"; }, 2000);
    } else {
      promiseambrani.style.display = "flex";
      setTimeout(() => { promiseambrani.style.display = "none"; promiseambranipress.style.display = "flex"; }, 2000);
    }
  };
  nextambBtn.onclick = handleNextAmb;
  nextambBtn.addEventListener('touchstart', handleNextAmb);

  promiseambranipress.onclick = () => { test.play(); promisejingle.play(); promisewtaud.stop(); promiseambranipress.style.display = "none"; promisesealedrani.style.display = "flex"; };
  promiseambranipress.addEventListener('touchstart', promiseambranipress.onclick);
  promiseambrajapress.onclick = () => { test.play(); promisejingle.play(); promisewtaud.stop(); promiseambrajapress.style.display = "none"; promisesealedraja.style.display = "flex"; };
  promiseambrajapress.addEventListener('touchstart', promiseambrajapress.onclick);

  // AED screen
  const handleNextAed = () => {
    aed.style.display = "none";
    promisewtaud.play();
    if (genderState === 1) {
      promiseaedraja.style.display = "flex";
      setTimeout(() => { promiseaedraja.style.display = "none"; promiseaedrajapress.style.display = "flex"; }, 2000);
    } else {
      promiseaedrani.style.display = "flex";
      setTimeout(() => { promiseaedrani.style.display = "none"; promiseaedranipress.style.display = "flex"; }, 2000);
    }
  };
  nextaedBtn.onclick = handleNextAed;
  nextaedBtn.addEventListener('touchstart', handleNextAed);

  promiseaedranipress.onclick = () => { promisewtaud.stop(); promisejingle.play(); test.play(); promiseaedranipress.style.display = "none"; promisesealedrani.style.display = "flex"; };
  promiseaedranipress.addEventListener('touchstart', promiseaedranipress.onclick);
  promiseaedrajapress.onclick = () => { promisewtaud.stop(); promisejingle.play(); test.play(); promiseaedrajapress.style.display = "none"; promisesealedraja.style.display = "flex"; };
  promiseaedrajapress.addEventListener('touchstart', promiseaedrajapress.onclick);

  // Late inactive
  const handleNextLateInactive = () => {
    lateinactive.style.display = "none";
    promiseiltaud.play();
    if (genderState === 1) {
      promiselateinactiveraja.style.display = "flex";
      setTimeout(() => { promiselateinactiveraja.style.display = "none"; promiselateinactiverajapress.style.display = "flex"; }, 2000);
    } else {
      promiselateinactiverani.style.display = "flex";
      setTimeout(() => { promiselateinactiverani.style.display = "none"; promiselateinactiveranipress.style.display = "flex"; }, 2000);
    }
  };
  nextlateinactiveBtn.onclick = handleNextLateInactive;
  nextlateinactiveBtn.addEventListener('touchstart', handleNextLateInactive);

  promiselateinactiveranipress.onclick = () => { promiseiltaud.stop(); promisejingle.play(); test.play(); promiselateinactiveranipress.style.display = "none"; promisesealedrani.style.display = "flex"; };
  promiselateinactiveranipress.addEventListener('touchstart', promiselateinactiveranipress.onclick);
  promiselateinactiverajapress.onclick = () => { promisejingle.play(); test.play(); promiseiltaud.stop(); promiselateinactiverajapress.style.display = "none"; promisesealedraja.style.display = "flex"; };
  promiselateinactiverajapress.addEventListener('touchstart', promiselateinactiverajapress.onclick);

  // Late fast
  const handleNextLateFast = () => {
    latefast.style.display = "none";
    promisefltaud.play();
    if (genderState === 1) {
      promiselatefastraja.style.display = "flex";
      setTimeout(() => { promiselatefastraja.style.display = "none"; promiselatefastrajapress.style.display = "flex"; }, 2000);
    } else {
      promiselatefastrani.style.display = "flex";
      setTimeout(() => { promiselatefastrani.style.display = "none"; promiselatefastranipress.style.display = "flex"; }, 2000);
    }
  };
  nextlatefastBtn.onclick = handleNextLateFast;
  nextlatefastBtn.addEventListener('touchstart', handleNextLateFast);

  promiselatefastranipress.onclick = () => { promisejingle.play(); test.play(); promisefltaud.stop(); promiselatefastranipress.style.display = "none"; promisesealedrani.style.display = "flex"; };
  promiselatefastranipress.addEventListener('touchstart', promiselatefastranipress.onclick);
  promiselatefastrajapress.onclick = () => { promisejingle.play(); test.play(); promisefltaud.stop(); promiselatefastrajapress.style.display = "none"; promisesealedraja.style.display = "flex"; };
  promiselatefastrajapress.addEventListener('touchstart', promiselatefastrajapress.onclick);

  // Late slow
  const handleNextLateSlow = () => {
    lateslow.style.display = "none";
    promisesltaud.play();
    if (genderState === 1) {
      promiselateslowraja.style.display = "flex";
      setTimeout(() => { promiselateslowraja.style.display = "none"; promiselateslowrajapress.style.display = "flex"; }, 2000);
    } else {
      promiselateslowrani.style.display = "flex";
      setTimeout(() => { promiselateslowrani.style.display = "none"; promiselateslowranipress.style.display = "flex"; }, 2000);
    }
  };
  nextlateslowBtn.onclick = handleNextLateSlow;
  nextlateslowBtn.addEventListener('touchstart', handleNextLateSlow);

  promiselateslowrajapress.onclick = () => { promisejingle.play(); test.play(); promisesltaud.stop(); promiselateslowrajapress.style.display = "none"; promisesealedraja.style.display = "flex"; };
  promiselateslowrajapress.addEventListener('touchstart', promiselateslowrajapress.onclick);
  promiselateslowranipress.onclick = () => { promisejingle.play(); test.play(); promisesltaud.stop(); promiselateslowranipress.style.display = "none"; promisesealedrani.style.display = "flex"; };
  promiselateslowranipress.addEventListener('touchstart', promiselateslowranipress.onclick);

}; // end window.onload

// ============================================================
//  P5 DRAW LOOP
// ============================================================
function draw() {
  if (listeningForResponse) {
    let vol = mic.getLevel();
    if (vol > 0.4) {
      listeningForResponse = false;
      clearTimeout(responseTimeout);
      responseTimeout = null;
      document.dispatchEvent(new Event("voiceDetected"));
      checkresponse.style.display = "none";
      awake.style.display = "flex";
      respondedaud.play();
      checkrAudio.pause();
      checkrAudio.currentTime = 0;
    }
  }

  if (!canvasActive) return;

  background("#FFC5B7");
  textAlign(CENTER, CENTER);
  textSize(32);
  fill(255);

  if (currentState === "play") { playScreen(); }
}

function mousePressed() {
  userStartAudio();
  pressed_time = millis();

  if (currentState == "play") {
    press_music.play();
    compression_count += 1;
    now = millis();
    if (lastTouchTime !== 0) {
      interval = now - lastTouchTime;
      bpm = 60000 / interval;
    }
    lastTouchTime = now;
    handle_live();
  }
}

// ============================================================
//  PLAY SCREEN (p5 canvas)
// ============================================================
function playScreen() {
  image(playimg, width / 2, height / 2);
  image(heartimg, width * 0.9, height * 0.08);

  // static bar background
  push();
  noStroke();
  fill("#EEEEEE");
  rect(122, 44, 200, 11, 11);
  pop();

  // BPM meter image
  push();
  imageMode(CENTER);
  image(meterimg, 78, 48);
  pop();

  // BPM number
  push();
  angleMode(RADIANS);
  translate(20, 48);
  rotate(-HALF_PI);
  textAlign(CENTER, TOP);
  textSize(23);
  fill(250, 50, 60);
  text(round(bpm), 0, 0);
  pop();

  // Compression count
  push();
  angleMode(RADIANS);
  translate(30, 335);
  rotate(-HALF_PI);
  textAlign(CENTER, TOP);
  textSize(23);
  fill(0);
  let numberToDisplay;
  if (compression_count === 0) { numberToDisplay = 0; }
  else if (compression_count % 5 === 0) { numberToDisplay = compression_count; }
  else { numberToDisplay = compression_count % 5; }
  text(numberToDisplay + " AND", 0, 0);
  pop();

  // Arrow
  push();
  translate(83, 47);
  imageMode(CENTER);
  angleMode(DEGREES);
  rotate(angle);
  image(arrowimg, 0, 0);
  pop();

  // Progress bar
  progress -= 1;
  progress = constrain(progress, 6, 200);
  push();
  noStroke();
  fill("#FF5058");
  rect(332, 44, -progress, 11, 11);
  pop();

  // Face colour feedback
  cheekOpacity = map(progress, 6, 210, 40, 255);
  lipOpacity   = map(progress, 6, 210, 120, 255);

  push();
  noStroke();
  fill(253, 175, 179, cheekOpacity);
  circle(width * 0.7, height * 0.2, 132);
  pop();

  push();
  noStroke();
  fill(253, 175, 179, cheekOpacity);
  circle(width * 0.7, height * 0.8, 132);
  pop();

  push();
  noStroke();
  fill(255, 124, 130, lipOpacity);
  ellipse(width * 0.82, height * 0.5, 42, 120);
  pop();

  // Time tracking
  play_elapsed = millis() - play_start_time;
  diffGoal = maxTotalCompressions - good_compression;

  // Time left display
  push();
  angleMode(RADIANS);
  translate(30, 520);
  rotate(-HALF_PI);
  textAlign(CENTER, TOP);
  textSize(20);
  fill(0);
  timeleft = constrain(task_time - play_elapsed, 0, task_time);
  text(round(timeleft / 1000) + "s", 0, 0);
  pop();

  push();
  angleMode(RADIANS);
  translate(52, 520);
  rotate(-HALF_PI);
  textAlign(CENTER, TOP);
  textSize(18);
  fill(0);
  text("Time left", 0, 0);
  pop();

  handle_performance();
  lastTouchElapsed = millis() - pressed_time;
  handle_inactivity();
}

function handle_inactivity() {
  if (lastTouchElapsed > 4000) {
    currentState = "lateinactive";
    p5Screen.style.display = "none";
    lateinactive.style.display = "flex";
    lateaud.play();
  }
}

function handle_live() {
  if (bpm <= 120 && bpm >= 100) {
    progress += goodfillRate;
    good_compression += 1;
    angle = 0;
  } else if (bpm > 121) {
    angle = 60;
    progress -= badfillRate;
    fastcount += 1;
  } else if (bpm < 100) {
    angle = -60;
    progress -= badfillRate;
    slowcount += 1;
  }
}

function handle_performance() {
  if (play_elapsed >= task_time) {
    if (diffGoal <= 5) {
      currentState = "win";
      p5Screen.style.display = "none";
      win.style.display = "flex";
      winaud.play();
    } else if (diffGoal <= 8) {
      currentState = "aed";
      p5Screen.style.display = "none";
      aed.style.display = "flex";
      aedaud.play(); winaud.play();
    } else if (diffGoal <= 10) {
      currentState = "amb";
      p5Screen.style.display = "none";
      amb.style.display = "flex";
      ambaud.play(); winaud.play();
    } else if (diffGoal >= 20) {
      if (fastcount > slowcount) {
        currentState = "latefast";
        p5Screen.style.display = "none";
        latefast.style.display = "flex";
        lateaud.play();
        // Inject live score into all latefast bubble text elements
        const fastMsg = `You were too fast! You got ${good_compression} / ${maxTotalCompressions} good compressions.`;
        document.querySelectorAll("#latefastText").forEach(el => el.textContent = fastMsg);
      } else if (slowcount > fastcount) {
        currentState = "lateslow";
        p5Screen.style.display = "none";
        lateslow.style.display = "flex";
        lateaud.play();
        // Inject live score into all lateslow bubble text elements
        const slowMsg = `You were too slow! You got ${good_compression} / ${maxTotalCompressions} good compressions.`;
        document.querySelectorAll("#lateslowText").forEach(el => el.textContent = slowMsg);
      }
    }
  }
}

function reset() {
  play_start_time = millis();
  good_compression = 0;
  compression_count = 0;
  progress = 0;
  angle = 0;
  bpm = 0;
  lastTouchTime = 0;
  interval = 0;
  fastcount = 0;
  slowcount = 0;
  breath_no = floor(random(11));
  dialedNumber = '';
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function touchStarted() {
  mousePressed();
  return false;
}
