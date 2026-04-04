import { useEffect, useRef } from "react";

export default function ImageMarquee() {
  const tracksRef = useRef<HTMLDivElement[]>([]);

  const cardsData = [
    {
      img: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&q=80&w=800",
      label: "Design Language // 01",
      title: "Obsidian Contour",
    },
    {
      img: "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=800",
      label: "Aerodynamics // 04",
      title: "Apex Sculpt",
    },
    {
      img: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&q=80&w=800",
      label: "Interface // 09",
      title: "Nerve Center",
    },
    {
      img: "https://images.unsplash.com/photo-1592198084033-aade902d1aae?auto=format&fit=crop&q=80&w=800",
      label: "Performance // 12",
      title: "Velocity Core",
    },
  ];

  const cardsDataReverse = [
    {
      img: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800",
      label: "Legacy // 02",
      title: "Silver Ghost",
    },
    {
      img: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&q=80&w=800",
      label: "Traction // 07",
      title: "Contact Patch",
    },
    {
      img: "https://images.unsplash.com/photo-1611016186353-9af58c69a533?auto=format&fit=crop&q=80&w=800",
      label: "Lumina // 05",
      title: "Photon Trace",
    },
    {
      img: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=800",
      label: "Powertrain // 11",
      title: "Thermal Mass",
    },
  ];

  useEffect(() => {
    const handleCardHover = (card: HTMLDivElement) => {
      card.addEventListener("mousemove", (e: MouseEvent) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const xc = rect.width / 2;
        const yc = rect.height / 2;
        const dx = x - xc;
        const dy = y - yc;

        card.style.transform = `perspective(1000px) rotateY(${dx / 20}deg) rotateX(${
          -dy / 20
        }deg) scale(1.02)`;
      });

      card.addEventListener("mouseleave", () => {
        card.style.transform = `perspective(1000px) rotateY(0deg) rotateX(0deg) scale(1)`;
      });
    };

    // Add hover effects to cards
    const cards = document.querySelectorAll(".marquee-card");
    cards.forEach((card) => {
      handleCardHover(card as HTMLDivElement);
    });

    // Add pause on hover for tracks
    const tracks = document.querySelectorAll(".marquee-track");
    tracks.forEach((track) => {
      track.addEventListener("mouseenter", () => {
        (track as HTMLElement).style.animationPlayState = "paused";
      });
      track.addEventListener("mouseleave", () => {
        (track as HTMLElement).style.animationPlayState = "running";
      });
    });
  }, []);

  const CardComponent = ({
    img,
    label,
    title,
  }: {
    img: string;
    label: string;
    title: string;
  }) => (
    <div className="marquee-card">
      <img src={img} alt={title} />
      <div className="card-info">
        <span className="card-label">{label}</span>
        <h3 className="card-title">{title}</h3>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        :root {
          --marquee-speed: 40s;
        }

        .marquee-section {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 2rem;
          padding: 4rem 0;
          overflow: hidden;
          mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
          background: #050505;
        }

        .marquee-track {
          display: flex;
          width: max-content;
          animation: scroll var(--marquee-speed) linear infinite;
        }

        .marquee-track.reverse {
          animation-direction: reverse;
        }

        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .marquee-card {
          position: relative;
          width: 500px;
          height: 320px;
          margin: 0 1rem;
          background: #0c0c0c;
          overflow: hidden;
          cursor: pointer;
          transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 12px;
        }

        .marquee-card::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(125deg,
            rgba(255, 255, 255, 0.12) 0%,
            rgba(255, 255, 255, 0) 40%,
            rgba(255, 255, 255, 0.05) 45%,
            rgba(255, 255, 255, 0) 100%);
          opacity: 0.5;
          transition: opacity 0.4s ease;
          pointer-events: none;
        }

        .marquee-card:hover::after {
          opacity: 0.8;
        }

        .marquee-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: grayscale(1) brightness(0.7) contrast(1.1);
          transition: all 0.8s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .marquee-card:hover img {
          filter: grayscale(0) brightness(1) contrast(1);
          transform: scale(1.05);
        }

        .card-info {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          padding: 2rem;
          z-index: 5;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, transparent 100%);
          transform: translateY(20px);
          opacity: 0;
          transition: all 0.5s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .marquee-card:hover .card-info {
          transform: translateY(0);
          opacity: 1;
        }

        .card-label {
          font-family: 'Space Mono', monospace;
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: #4a4a4a;
          margin-bottom: 0.5rem;
          display: block;
        }

        .card-title {
          font-size: 1.5rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: -0.02em;
          color: white;
        }

        @media (max-width: 768px) {
          .marquee-card { 
            width: 300px; 
            height: 200px; 
          }
          .marquee-section {
            padding: 2rem 0;
          }
          .card-title {
            font-size: 1.1rem;
          }
        }
      `}</style>

      <section className="marquee-section">
        {/* First Row: Forward */}
        <div className="marquee-track" ref={(el) => el && (tracksRef.current[0] = el)}>
          {cardsData.map((card, idx) => (
            <CardComponent key={`forward-${idx}`} {...card} />
          ))}
          {cardsData.map((card, idx) => (
            <CardComponent key={`forward-dup-${idx}`} {...card} />
          ))}
        </div>

        {/* Second Row: Reverse */}
        <div
          className="marquee-track reverse"
          ref={(el) => el && (tracksRef.current[1] = el)}
        >
          {cardsDataReverse.map((card, idx) => (
            <CardComponent key={`reverse-${idx}`} {...card} />
          ))}
          {cardsDataReverse.map((card, idx) => (
            <CardComponent key={`reverse-dup-${idx}`} {...card} />
          ))}
        </div>
      </section>
    </>
  );
}
