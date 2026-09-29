export const faqTopics = [
  {
    id: 'portrait',
    label: 'Your Portrait',
    questions: [
      ['What kind of photos should I upload?', 'Clear, well-lit photos with your face easy to see, from a few different angles. Skip heavy filters.'],
      ['How many photos do I need?', '3 to 8 photos work best.'],
      [
        'How is my portrait created?',
        'You choose your house, tell us your story and send us your photos. Our team turns them into a custom animated portrait, themed to your house and the life you imagine there.',
      ],
      ['Can I request changes?', 'Yes. You see a preview before we make your frame, and you can ask for up to two rounds of changes.'],
      [
        'How long does it take?',
        'Your preview is usually ready within 7 days of receiving your photos. Once you approve it, we frame your portrait and ship it within 10 days.',
      ],
      [
        'Can I change my portrait later?',
        "Your portrait is loaded onto your frame before it ships, so it's made to last. If you'd like a new portrait one day, write to us and we'll help.",
      ],
    ],
  },
  {
    id: 'frame',
    label: 'The Frame',
    questions: [
      ['How big is the frame?', '49.9 cm tall and 30.2 cm wide.'],
      ['How is it powered?', 'It plugs into a standard power outlet. The adapter and cable are included.'],
      [
        'Does it need Wi-Fi or an app?',
        'No. Your frame arrives with your portrait already loaded. Plug it in and it comes to life, with no app, account or Wi-Fi to set up.',
      ],
      [
        'Does the portrait have sound?',
        'Yes. Your portrait can speak, and it reacts to the room around it: a motion sensor wakes it when someone walks by, and a sound sensor lets it respond to voices nearby.',
      ],
    ],
  },
  {
    id: 'ordering',
    label: 'Ordering',
    questions: [
      ['How do I place an order?', 'Choose your house, tell us your story, upload your photos, approve your preview and check out.'],
      ['Which payment methods do you accept?', 'UPI, all major credit and debit cards, and net banking.'],
      [
        'Can I order as a gift?',
        "Yes. You'll need a few clear photos of the person you're gifting it to, and we can ship the frame straight to them.",
      ],
    ],
  },
  {
    id: 'drop',
    label: 'The Drop',
    questions: [
      [
        'Why is Wizardify sold in drops?',
        'Every portrait is made for one person and every frame is finished by hand, so we make a limited number at a time. Selling in drops lets us give each one the care it deserves.',
      ],
      [
        'When is the next drop?',
        "We haven't announced the date yet. Reserve your place and you'll hear first, before the doors open to everyone.",
      ],
      [
        'Does the waitlist guarantee a frame?',
        "No, because each drop is limited. Reserving gives you early access before the public, and members whose portrait preferences are on record are first in line.",
      ],
    ],
  },
  {
    id: 'general',
    label: 'General',
    questions: [
      ['Where do you ship?', "We ship across India and internationally. You'll see delivery times and costs at checkout, before you pay."],
      [
        'What if my frame arrives damaged?',
        "Every frame is packed with care, but if yours arrives damaged, email us a photo within 48 hours of delivery and we'll send a replacement at no cost.",
      ],
      ['How do I contact you?', 'Write to us at hello@wizardify.me, or send us a message on Instagram.'],
    ],
  },
] as const
