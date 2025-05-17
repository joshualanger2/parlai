export default function AboutPage() {
  const teamMembers = [
    {
      name: "Young Jun",
      role: "Founder & CEO",
      bio: "Young has been building developer tools for over a decade."
    },
    {
      name: "Maria Garcia",
      role: "Lead Engineer",
      bio: "Maria specializes in making complex tools simple to use."
    }
  ];

  return (
    <main className="about-page">
      <section className="about-hero">
        <h1>About Parlai</h1>
        <p>
          We're on a mission to make internationalization accessible to every React developer.
          Our tools are built with love and attention to detail, ensuring your journey to
          global reach is smooth and enjoyable.
        </p>
      </section>

      <section className="our-story">
        <h2>Our Story</h2>
        <p>
          Parlai was born from a simple observation: internationalizing React apps was too hard.
          We believed there had to be a better way. After months of development and testing,
          we created a solution that makes i18n feel like magic.
        </p>
        <p>
          Today, we're proud to help developers around the world make their apps accessible
          to global audiences with minimal effort.
        </p>
      </section>

      <section className="team">
        <h2>Meet Our Team</h2>
        <div className="team-grid">
          {teamMembers.map((member) => (
            <div key={member.name} className="team-member">
              <h3>{member.name}</h3>
              <p className="role">{member.role}</p>
              <p className="bio">{member.bio}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="values">
        <h2>Our Values</h2>
        <ul>
          <li>
            <h3>Simplicity First</h3>
            <p>We believe the best tools are the ones you barely notice using.</p>
          </li>
          <li>
            <h3>Developer Experience</h3>
            <p>Every feature we build starts with the developer's needs in mind.</p>
          </li>
          <li>
            <h3>Global Mindset</h3>
            <p>We're building tools for a connected world where every app can reach every user.</p>
          </li>
        </ul>
      </section>

      <section className="contact">
        <h2>Get in Touch</h2>
        <p>Have questions? We'd love to hear from you. Send us a message at hello@parlai.com</p>
      </section>
    </main>
  );
} 