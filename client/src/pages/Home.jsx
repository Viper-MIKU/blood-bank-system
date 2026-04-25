import { motion } from "framer-motion";
import Particles from "react-tsparticles";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";


export default function Home() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="home">
      <Particles
        options={{
          background: { color: "transparent" },
          particles: {
            number: { value: isMobile ? 30 : 80 },
            size: { value: 2 },
            move: { enable: true, speed: 0.8 },
            links: {
              enable: true,
              color: "#e53935",
              distance: 150,
              opacity: 0.3,
            },
            shape: {
              type: "circle",
            },
          },
          interactivity: {
            events: {
              onHover: {
                enable: true,
                mode: "repulse",
              },
            },
          },
        }}
        style={{
          position: "absolute",
          zIndex: 0,
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
      />

      <section className="hero">
        <div className="hero-content">
          <motion.div
            className="hero-text"
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.div
              className="hero-badge"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <span className="badge-dot"></span> URGENT NEED: TYPE O-
            </motion.div>

            <h1>
              <span className="hero-title-main">Save a Life</span>
              <span className="hero-title-highlight">Today.</span>
            </h1>

            <p className="hero-description">
              Every drop counts. Join thousands of heroes in your
              community providing life-saving blood to patients in critical
              need. Your single donation can save up to three lives.
            </p>

            <div className="hero-buttons">
              <Link to="/users">
                <motion.button
                  className="btn btn-primary btn-large"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Find a Center →
                </motion.button>
              </Link>

              <Link to="/register">
                <motion.button
                  className="btn btn-secondary btn-large"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Check Eligibility
                </motion.button>
              </Link>
            </div>
            
            <motion.div 
              className="hero-avatars-group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <div className="avatars">
                <div className="avatar"><img src="https://i.pravatar.cc/100?img=1" alt="donor" /></div>
                <div className="avatar"><img src="https://i.pravatar.cc/100?img=2" alt="donor" /></div>
                <div className="avatar"><img src="https://i.pravatar.cc/100?img=3" alt="donor" /></div>
                <div className="avatar more">+12k</div>
              </div>
              <span className="avatars-text">Join our community of donors</span>
            </motion.div>
          </motion.div>

          <motion.div
            className="hero-visual"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            <div className="hero-image-wrapper">
              <motion.img 
                src="/hero_illustration.png" 
                alt="Blood Donation Illustration" 
                className="hero-image animated-illustration"
                animate={{ y: [0, -15, 0] }}
                transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              />
              
              <motion.div 
                className="impact-card"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1, duration: 0.5 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="impact-icon-wrapper">
                  <span className="impact-icon">❤️</span>
                </div>
                <div className="impact-details">
                  <span className="impact-label">TODAY&apos;S IMPACT</span>
                  <span className="impact-value">1,248 Pints</span>
                  <span className="impact-trend">+12% from yesterday</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        <div className="hero-bg-elements">
          <div className="bg-circle circle-1"></div>
          <div className="bg-circle circle-2"></div>
          <div className="bg-circle circle-3"></div>
        </div>
      </section>

      <motion.section
        className="features"
        initial={{ opacity: 0, y: 80 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <div className="features-container">
          <div className="features-header">
            <h2>Why Choose Our Platform?</h2>
            <p>We are revolutionizing blood donation with technology and compassion</p>
          </div>

          <div className="features-grid">
            {[
              {
                icon: "🔗",
                title: "Easy Connection",
                desc: "Connect with donors and recipients instantly through our smart matching system",
              },
              {
                icon: "📱",
                title: "Mobile Friendly",
                desc: "Access our platform anywhere, anytime with our responsive mobile design",
              },
              {
                icon: "✅",
                title: "Verified Donors",
                desc: "All donors are verified and their blood types are confirmed for safety",
              },
              {
                icon: "🚀",
                title: "Fast Response",
                desc: "Emergency requests get priority matching within minutes",
              },
              {
                icon: "📊",
                title: "Track Impact",
                desc: "See how your donations are making a real difference in the community",
              },
              {
                icon: "🤝",
                title: "Community Driven",
                desc: "Join a supportive community of heroes saving lives every day",
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                className="feature-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section
        className="how-it-works"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <div className="how-container">
          <h2>How It Works</h2>
          <p>Getting started is simple and takes less than 5 minutes</p>

          <div className="steps">
            {[
              {
                step: "01",
                title: "Create Account",
                desc: "Sign up and complete your donor profile with blood type and location",
              },
              {
                step: "02",
                title: "Get Matched",
                desc: "Browse available donors or post a request for specific blood types",
              },
              {
                step: "03",
                title: "Save Lives",
                desc: "Connect directly and arrange donation at a certified center",
              },
              {
                step: "04",
                title: "Track Impact",
                desc: "Monitor your donations and see how many lives you&apos;ve helped save over time",
              },
            ].map((step, i) => (
              <motion.div
                key={i}
                className="step"
                initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.2, duration: 0.6 }}
                viewport={{ once: true }}
              >
                <div className="step-number">{step.step}</div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section
        className="cta-section"
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <div className="cta-content">
          <h2>Ready to Make a Difference?</h2>
          <p>Join thousands of donors and recipients who are saving lives every day</p>

          <div className="cta-buttons">
            <Link to="/register">
              <motion.button
                className="btn btn-primary btn-xl"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Start Saving Lives Today
              </motion.button>
            </Link>

            <Link to="/login">
              <motion.button
                className="btn btn-outline btn-xl"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Already Have Account?
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
