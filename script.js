"use strict";

// Mobile navigation
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

menuToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

navLinks.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});

// Educational password strength estimator.
// It never sends the password anywhere.
const passwordInput = document.getElementById("passwordInput");
const togglePassword = document.getElementById("togglePassword");
const strengthBar = document.getElementById("strengthBar");
const strengthText = document.getElementById("strengthText");

togglePassword.addEventListener("click", () => {
  const showing = passwordInput.type === "text";
  passwordInput.type = showing ? "password" : "text";
  togglePassword.textContent = showing ? "Show" : "Hide";
  togglePassword.setAttribute(
    "aria-label", showing ? "Show password" : "Hide password"
  );
});

function updateRule(id, passed) {
  const element = document.getElementById(id);
  element.textContent = (passed ? "✓ " : "○ ") +
    ({
      lengthRule: "Use 15 or more characters",
      upperRule: "Include varied character types",
      lowerRule: "Avoid predictable words or patterns",
      numberRule: "Use a unique password for each account"
    }[id]);
  element.style.color = passed ? "#58e6db" : "#a7b2c9";
}

passwordInput.addEventListener("input", () => {
  const password = passwordInput.value;
  const lengthOK = password.length >= 15;
  const varietyOK = [
    /[a-z]/.test(password),
    /[A-Z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password)
  ].filter(Boolean).length >= 3;

  // This simple heuristic cannot reliably detect common or breached passwords.
  const predictable = /password|qwerty|123456|abcdef|letmein/i.test(password);
  const score = [
    lengthOK,
    varietyOK,
    !predictable,
    password.length >= 20
  ].filter(Boolean).length;

  updateRule("lengthRule", lengthOK);
  updateRule("upperRule", varietyOK);
  updateRule("lowerRule", !predictable);
  updateRule("numberRule", false);

  const labels = ["Very weak", "Weak", "Fair", "Good", "Stronger by these basic checks"];
  const colors = ["#ff6565", "#ff8d65", "#ffcb69", "#65c7ff", "#58e6db"];

  strengthBar.style.width = password.length
    ? `${Math.max(8, (score / 4) * 100)}%`
    : "0%";
  strengthBar.style.background = colors[password.length ? score : 0];
  strengthText.textContent = password.length
    ? labels[score] + (predictable ? " — avoid common patterns." : ".")
    : "Your result will appear here.";
});

// Cyber safety quiz
const questions = [
  {
    question: "1. Which is the safest password habit?",
    options: [
      "Use your birthday",
      "Reuse one password everywhere",
      "Use a unique, long password for each account",
      "Share it with friends"
    ],
    answer: 2,
    explanation: "Unique, long passwords help limit damage if one account is compromised."
  },
  {
    question: "2. Someone calls asking for your bank OTP. What should you do?",
    options: [
      "Share it if they know your name",
      "Never share it; verify through official channels",
      "Send it by message instead",
      "Share it if they sound trustworthy"
    ],
    answer: 1,
    explanation: "Never disclose OTPs, PINs, or passwords to callers."
  },
  {
    question: "3. What should you do with an unexpected suspicious link?",
    options: [
      "Open it immediately",
      "Forward it to everyone",
      "Enter your details to check",
      "Verify the sender and destination independently"
    ],
    answer: 3,
    explanation: "Unexpected links can lead to phishing pages or malicious downloads."
  },
  {
    question: "4. What does multi-factor authentication do?",
    options: [
      "Adds another verification step",
      "Makes every password public",
      "Removes the need for updates",
      "Shares your account with others"
    ],
    answer: 0,
    explanation: "MFA adds a verification factor beyond your password."
  },
  {
    question: "5. Which is a good personal data protection practice?",
    options: [
      "Make all social media posts public",
      "Grant every app every permission",
      "Review privacy settings and app permissions",
      "Post identity documents online"
    ],
    answer: 2,
    explanation: "Limiting unnecessary access and sharing reduces privacy risks."
  }
];

let currentQuestion = 0;
let score = 0;
let answered = false;

const questionCount = document.getElementById("questionCount");
const scoreLabel = document.getElementById("scoreLabel");
const questionElement = document.getElementById("question");
const optionsElement = document.getElementById("options");
const quizFeedback = document.getElementById("quizFeedback");
const nextButton = document.getElementById("nextButton");
const restartButton = document.getElementById("restartButton");
const quizProgress = document.getElementById("quizProgress");

function renderQuestion() {
  answered = false;
  const q = questions[currentQuestion];

  questionCount.textContent =
    `Question ${currentQuestion + 1} of ${questions.length}`;
  scoreLabel.textContent = `Score: ${score}`;
  questionElement.textContent = q.question;
  quizFeedback.textContent = "";
  optionsElement.replaceChildren();

  quizProgress.style.width =
    `${(currentQuestion / questions.length) * 100}%`;

  q.options.forEach((option, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "option";
    button.textContent = option;
    button.addEventListener("click", () => chooseAnswer(index));
    optionsElement.appendChild(button);
  });

  nextButton.disabled = true;
  nextButton.hidden = false;
  restartButton.hidden = true;
  nextButton.textContent =
    currentQuestion === questions.length - 1
      ? "See Results →"
      : "Next Question →";
}

function chooseAnswer(index) {
  if (answered) return;
  answered = true;

  const q = questions[currentQuestion];
  const buttons = optionsElement.querySelectorAll("button");

  buttons.forEach((button, i) => {
    button.disabled = true;
    if (i === q.answer) button.classList.add("correct");
    if (i === index && i !== q.answer) button.classList.add("wrong");
  });

  if (index === q.answer) {
    score++;
    quizFeedback.textContent = "Correct! " + q.explanation;
  } else {
    quizFeedback.textContent = "Not quite. " + q.explanation;
  }

  scoreLabel.textContent = `Score: ${score}`;
  nextButton.disabled = false;
  quizProgress.style.width =
    `${((currentQuestion + 1) / questions.length) * 100}%`;
}

nextButton.addEventListener("click", () => {
  if (!answered) return;

  if (currentQuestion < questions.length - 1) {
    currentQuestion++;
    renderQuestion();
  } else {
    showResults();
  }
});

function showResults() {
  questionCount.textContent = "Quiz completed!";
  questionElement.textContent = `You scored ${score} out of ${questions.length}.`;
  optionsElement.replaceChildren();

  const message = document.createElement("p");
  message.textContent = score === 5
    ? "Excellent! You have a strong understanding of these safety basics."
    : score >= 3
      ? "Good effort! Review the tips and keep improving your digital habits."
      : "Keep learning! Review the password, privacy, and scam awareness sections.";
  optionsElement.appendChild(message);

  quizFeedback.textContent =
    "This quiz is educational and does not certify cybersecurity expertise.";
  scoreLabel.textContent = `Final score: ${score}/${questions.length}`;
  quizProgress.style.width = "100%";
  nextButton.hidden = true;
  restartButton.hidden = false;
}

restartButton.addEventListener("click", () => {
  currentQuestion = 0;
  score = 0;
  renderQuestion();
});

renderQuestion();

// Feedback form demonstration.
// No data is transmitted or persisted.
const feedbackForm = document.getElementById("feedbackForm");
const formMessage = document.getElementById("formMessage");

feedbackForm.addEventListener("submit", event => {
  event.preventDefault();

  if (!feedbackForm.reportValidity()) return;

  formMessage.textContent =
    "Thank you for your feedback! This demo does not send or save submissions.";
  formMessage.style.color = "#58e6db";
  feedbackForm.reset();
});