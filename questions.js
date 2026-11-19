/**
 * Husky Firewall — Hosford Middle School AI & Digital Citizenship Question Bank
 * Curated multiple-choice scenarios for grades 6–8.
 */
(function (global) {
  "use strict";

  global.HUSKY_QUESTIONS = [
    {
      category: "AI LITERACY",
      prompt: "You're stuck starting a history paragraph at Hosford. What is the most responsible way to use AI?",
      choices: [
        "Ask AI to brainstorm ideas or explain the topic, then write the paragraph in your own words.",
        "Have AI write the whole paragraph and turn it in as your own work.",
        "Copy AI's paragraph and swap out two or three words so it looks different.",
        "Ask AI to write it and erase your browser history so nobody notices."
      ],
      correctIndex: 0,
      feedback: "Using AI as a thinking partner—when your teacher allows it—helps you learn while keeping the work authentically yours."
    },
    {
      category: "AI LITERACY",
      prompt: "An AI chatbot gives you an amazing quote and date for your science report. What should you do next?",
      choices: [
        "Paste it straight into your slides because AI always pulls true facts.",
        "Verify the quote and date with a trusted book, encyclopedia, or reliable website.",
        "Keep it as long as the wording sounds confident and smart.",
        "Ask the same AI if it is sure, and skip checking anywhere else."
      ],
      correctIndex: 1,
      feedback: "AI tools can 'hallucinate' convincing but fake facts or quotes—always fact-check with reliable sources."
    },
    {
      category: "AI PRIVACY",
      prompt: "Which of these is SAFE to type into a public AI chatbot?",
      choices: [
        "Your full name, home address, and school password.",
        "A classmate's phone number and private drama from lunch.",
        "A general question asking for 3 study tips on fractions.",
        "A photo of your student ID card and schedule."
      ],
      correctIndex: 2,
      feedback: "Never share personal, private, or classmate information with AI tools—many prompts can be saved or reviewed."
    },
    {
      category: "AI ETHICS",
      prompt: "Someone in a group chat sends an AI-edited photo making fun of a Hosford classmate. What's the right Husky move?",
      choices: [
        "Forward it to one friend because it's obviously fake.",
        "Laugh react so you don't stand out.",
        "Do not share it, support your classmate, and report it to a trusted adult.",
        "Make an AI photo back to get even."
      ],
      correctIndex: 2,
      feedback: "AI fakes used to embarrass someone are still cyberbullying. Refusing to spread them and getting help protects your community."
    },
    {
      category: "AI LITERACY",
      prompt: "You're not sure if AI is allowed on tonight's English homework. What should you do?",
      choices: [
        "Check the assignment directions or ask your teacher before using AI.",
        "Use AI anyway and only admit it if the teacher asks.",
        "Assume AI is always allowed if the assignment didn't mention it.",
        "Use AI for every answer except the last question."
      ],
      correctIndex: 0,
      feedback: "Every class and project has different goals—checking with your teacher first keeps you honest and clear on expectations."
    },
    {
      category: "AI LITERACY",
      prompt: "You see a wild video online of a famous person saying something shocking. How can you spot if it might be an AI deepfake?",
      choices: [
        "Repost it right away to see if your friends think it's real.",
        "Check trusted news sources, look closely for unnatural glitches, and verify before sharing.",
        "Trust it automatically if it has thousands of likes and views.",
        "Read only the top comment to decide if it is true."
      ],
      correctIndex: 1,
      feedback: "Viral likes don't prove something is real. Checking multiple credible news sources stops deepfakes and rumors from spreading."
    },
    {
      category: "AI LITERACY",
      prompt: "Why can AI tools sometimes give unfair or biased answers?",
      choices: [
        "Because AI learns from human-created data that can contain human biases.",
        "Because AI has personal feelings and holds grudges.",
        "Because AI only works properly on brand-new computers.",
        "AI is pure math, so it can never be biased."
      ],
      correctIndex: 0,
      feedback: "AI learns patterns from massive datasets made by people, so it's important to think critically and question its output."
    },
    {
      category: "AI LITERACY",
      prompt: "How can AI be genuinely helpful when studying for a math quiz?",
      choices: [
        "Having it solve your homework while you play games.",
        "Asking it to walk through an example problem step-by-step and quiz you on similar ones.",
        "Memorizing its answers without learning why they work.",
        "Copying its steps even when they don't match what you learned."
      ],
      correctIndex: 1,
      feedback: "Using AI to explain tricky steps and generate practice problems builds your own skills for test day."
    },
    {
      category: "DIGITAL CITIZENSHIP",
      prompt: "You see unkind comments piling up on a classmate's post. What does being an 'upstander' look like?",
      choices: [
        "Adding a sarcastic joke to keep the thread going.",
        "Screenshotting it to gossip about it at school tomorrow.",
        "Checking in kindly with your classmate and reporting the bullying.",
        "Ignoring every comment forever and joining in if friends do."
      ],
      correctIndex: 2,
      feedback: "Even one kind message or report from a Husky upstander can make a huge difference for someone being targeted online."
    },
    {
      category: "DIGITAL CITIZENSHIP",
      prompt: "A pop-up or DM says: 'FREE game currency! Just log in with your school or game password here!' What should you do?",
      choices: [
        "Enter your password quickly before the offer expires.",
        "Try a friend's login first to test if it's real.",
        "Close it without clicking—it's a phishing scam designed to steal accounts.",
        "Reply asking them to promise it isn't a scam."
      ],
      correctIndex: 2,
      feedback: "Real companies never ask for your password through random DMs or 'free prize' links. Don't click—block and report."
    },
    {
      category: "DIGITAL CITIZENSHIP",
      prompt: "Your best friend asks for your school Chromebook password to check a shared doc. What should you do?",
      choices: [
        "Share your password since you trust them completely.",
        "Keep your password private and use the Share button on the document instead.",
        "Write your password on a sticky note on their locker.",
        "Give it to them as long as they promise to forget it."
      ],
      correctIndex: 1,
      feedback: "Passwords protect your identity and schoolwork. Use built-in sharing tools instead of ever giving away your login."
    },
    {
      category: "DIGITAL CITIZENSHIP",
      prompt: "You took a funny photo with two friends after school and want to post it. What should you do first?",
      choices: [
        "Post it immediately—you took the picture, so it's up to you.",
        "Ask both friends if they're okay with you posting it before sharing.",
        "Post it now and delete it later if they get upset.",
        "Tag them without telling them as a surprise."
      ],
      correctIndex: 1,
      feedback: "Asking permission respects your friends' privacy and helps everyone stay in control of their digital footprint."
    },
    {
      category: "DIGITAL CITIZENSHIP",
      prompt: "Why do people say your 'digital footprint' matters even if you delete a post?",
      choices: [
        "Once something is online, others can screenshot, save, or reshare it in seconds.",
        "Deleted posts automatically reappear every Monday.",
        "It only matters once you turn 18.",
        "Deleting a post erases every copy from everyone's phone."
      ],
      correctIndex: 0,
      feedback: "Pausing for 5 seconds before posting helps make sure your online choices reflect the person you want to be."
    },
    {
      category: "DIGITAL CITIZENSHIP",
      prompt: "Someone you only met in an online game starts asking what school you go to and what neighborhood you live in. What's the safest response?",
      choices: [
        "Tell them just your school name so you seem friendly.",
        "Refuse to share personal info, block/report them, and tell a trusted adult.",
        "Ask them their school first before sharing yours.",
        "Send a photo from outside your house so they know you're real."
      ],
      correctIndex: 1,
      feedback: "Never share your school, location, or personal details with online strangers—block, report, and loop in a parent or guardian."
    },
    {
      category: "DIGITAL CITIZENSHIP",
      prompt: "A classmate sends a text that makes you really frustrated. What is the smartest move before replying?",
      choices: [
        "Type an angry all-caps reply immediately so you win the argument.",
        "Screenshot it and send it to a big group chat to get backup.",
        "Step away, take a breath, and talk it out calmly—or in person when ready.",
        "Spam them with 20 messages until they apologize."
      ],
      correctIndex: 2,
      feedback: "Text lacks tone and facial expressions, so misunderstandings blow up fast. Pausing before hitting send prevents regret."
    },
    {
      category: "DIGITAL CITIZENSHIP",
      prompt: "You found a great photograph and facts online for a Hosford slideshow. How should you use them respectfully?",
      choices: [
        "Claim you took the photo and wrote the facts yourself.",
        "Use copyright-friendly images, put facts in your own words, and cite your sources.",
        "Crop out the photographer's watermark so it looks cleaner.",
        "Paste whole paragraphs as long as you change the font."
      ],
      correctIndex: 1,
      feedback: "Giving credit respects creators' hard work and shows your audience where your reliable evidence came from."
    },
    {
      category: "DIGITAL CITIZENSHIP",
      prompt: "Your phone keeps buzzing with notifications at 11:30 PM on a school night. What is a healthy digital habit?",
      choices: [
        "Keep scrolling until your battery hits 1%.",
        "Put your phone on Do Not Disturb and charge it away from your bed.",
        "Reply to every notification immediately so no one thinks you're asleep.",
        "Turn screen brightness all the way up so you stay awake."
      ],
      correctIndex: 1,
      feedback: "Setting tech boundaries at night gives your brain real rest so you feel sharp, calm, and ready for the day."
    },
    {
      category: "AI ETHICS",
      prompt: "Your teacher allows you to use an AI tool to help check grammar on your essay. What is the best final step?",
      choices: [
        "Review every suggestion yourself to make sure it still sounds like you, and note how you used AI if asked.",
        "Accept every change without reading it.",
        "Ask AI to rewrite your whole voice into college-level vocabulary you don't understand.",
        "Hide the fact that you used any tool at all."
      ],
      correctIndex: 0,
      feedback: "Staying in the driver's seat—reviewing suggestions and being transparent—keeps your voice authentic and builds real writing skill."
    },
    {
      category: "DEEPFAKES",
      prompt: "You get an urgent voice message that sounds like a family member asking you to send gift card codes right away. What should you do?",
      choices: [
        "Send the codes immediately because the voice sounds just like them.",
        "Stop, hang up, and check with that person or a parent/guardian using a trusted phone number.",
        "Reply asking them to say your name so you can be sure.",
        "Post the voice note online to ask strangers if it's real."
      ],
      correctIndex: 1,
      feedback: "Scammers can clone voices with AI from just a few seconds of audio. Always verify urgent money or gift-card requests directly with a trusted adult."
    },
    {
      category: "AI HALLUCINATIONS",
      prompt: "An AI tool creates a list of 4 book titles and website links for your Hosford research project. What must you check before putting them in your bibliography?",
      choices: [
        "Check that each book or webpage actually exists and really supports what you wrote.",
        "Only check that the links start with 'https://'.",
        "Nothing—AI never invents fake titles or broken URLs.",
        "Pick the longest title because longer citations look more official."
      ],
      correctIndex: 0,
      feedback: "AI frequently 'hallucinates' realistic-looking book titles, authors, and URLs that don't exist. Always open and verify every source yourself."
    },
    {
      category: "STRONG PASSWORDS",
      prompt: "Which of these is the STRONGEST password for protecting your account?",
      choices: [
        "hosford2026",
        "12345678!",
        "Purple-Husky!74#River",
        "Your first name plus your birthday"
      ],
      correctIndex: 2,
      feedback: "A long passphrase combining unrelated words, uppercase/lowercase letters, numbers, and symbols is much harder to crack than short or personal passwords."
    },
    {
      category: "STRONG PASSWORDS",
      prompt: "Why is it risky to reuse the exact same password on your gaming app, personal email, and school account?",
      choices: [
        "It makes your Wi-Fi connection run slower.",
        "If one site has a data breach, hackers can try that same password to break into your other accounts.",
        "Websites delete accounts that share the same password.",
        "Reusing passwords is only a problem for adults."
      ],
      correctIndex: 1,
      feedback: "Using a unique password for each important account stops a single leak on one site from exposing everything else you own."
    },
    {
      category: "COPYRIGHT & FAIR USE",
      prompt: "Which example best fits 'fair use' for a middle school media project?",
      choices: [
        "Re-uploading an entire copyrighted movie to your channel so friends can watch it free.",
        "Using a 10-second clip of a song while analyzing its rhythm for class and crediting the artist.",
        "Using a popular full-length song as background music for a public video without permission.",
        "Copying an illustrator's artwork and selling stickers of it."
      ],
      correctIndex: 1,
      feedback: "Fair use generally allows brief excerpts for education, critique, or commentary with credit—not re-uploading whole works without permission."
    },
    {
      category: "COPYRIGHT & FAIR USE",
      prompt: "You need photos for a public Hosford club poster. Which image source respects copyright?",
      choices: [
        "Any random image from Google Search as long as you don't pay for it.",
        "Photos labeled Creative Commons (following license rules), public domain images, or photos you took yourself.",
        "A photographer's copyrighted photo after cropping off their name.",
        "A screenshot of a paid stock photo with the watermark still on it."
      ],
      correctIndex: 1,
      feedback: "Just because an image shows up in search results doesn't mean it's free to use. Look for Creative Commons, public domain, or original photos and give credit."
    },
    {
      category: "CYBERBULLYING",
      prompt: "An anonymous account starts sending you repeated mean DMs after school. What is the safest and smartest response?",
      choices: [
        "Send harsh insults back so they know you aren't scared.",
        "Delete the messages right away without telling anyone.",
        "Don't reply, take screenshots as evidence, block and report the account, and tell a trusted adult.",
        "Create a fake account to figure out who it is on your own."
      ],
      correctIndex: 2,
      feedback: "Saving evidence, blocking/reporting, and looping in a parent, guardian, or Hosford counselor keeps you safe and stops cyberbullying faster."
    }
  ];
})(window);
