import React, { useCallback, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowUpRight,
  Brain,
  Megaphone,
  Menu,
  TrendingUp,
  X
} from "lucide-react";
import DriftWall from "./components/DriftWall";
import AccordionGallery from "./components/AccordionGallery";
import Ballpit from "./components/Ballpit";
import BorderGlow from "./components/BorderGlow";
import FluidGlass from "./components/FluidGlass";
import LineSidebar from "./components/LineSidebar";
import MagicRings from "./components/MagicRings";
import { MagicBentoFrame } from "./components/MagicBento";
import ParticleText from "./components/ParticleText";
import PillNav from "./components/PillNav";
import RotatingText from "./components/RotatingText";
import Shuffle from "./components/Shuffle";
import ShapeBlur from "./components/ShapeBlur";
import SplashCursor from "./components/SplashCursor";
import ScrollVelocity from "./components/ScrollVelocity";
import SplitText from "./components/SplitText";
import SpecularButton from "./components/SpecularButton";
import TrueFocus from "./components/TrueFocus";
import "./styles.css";
import { assetUrl, capabilities, filmProjects, navItems, posterArchive, profile } from "./data/profile";

const punctuationPattern = /[，。！？、；：…—–·,.!?;:“”‘’'"（）()《》〈〉【】\[\]{}\/|×]/g;
const cleanText = (value) => String(value ?? "").replace(punctuationPattern, " ").replace(/\s+/g, " ").trim();

const cleanCapabilities = capabilities.map((item) => ({ ...item, title: cleanText(item.title), text: cleanText(item.text) }));
const cleanFilmProjects = filmProjects.map((item) => ({
  ...item,
  title: cleanText(item.title),
  category: cleanText(item.category),
  summary: cleanText(item.summary),
  year: cleanText(item.year),
  result: cleanText(item.result)
}));
const cleanPosterArchive = posterArchive.map((poster) => ({ ...poster, title: cleanText(poster.title) }));

const driftWallItems = cleanPosterArchive.map((poster, index) => ({
  ...poster,
  href: `#project-poster-${index + 1}`
}));

function ArrowIcon({ direction = "right" }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={direction === "left" ? "icon-reverse" : undefined}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

function useReveal() {
  useEffect(() => {
    const elements = document.querySelectorAll("[data-reveal]");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);
}

function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const media = window.matchMedia(query);
    const handleChange = () => setMatches(media.matches);
    handleChange();
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, [query]);

  return matches;
}

function usePauseOffscreenAnimations() {
  useEffect(() => {
    const sections = [...document.querySelectorAll(".lithos-hero, #main-content > section")];
    let frame = 0;
    const sync = () => {
      frame = 0;
      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        section.classList.toggle("is-offscreen", rect.bottom <= 0 || rect.top >= window.innerHeight || document.hidden);
      });
    };
    const scheduleSync = () => {
      if (!frame) frame = requestAnimationFrame(sync);
    };
    const observer = new IntersectionObserver(scheduleSync);
    sections.forEach((section) => {
      section.classList.add("is-offscreen");
      observer.observe(section);
    });
    window.addEventListener("scroll", scheduleSync, { passive: true });
    window.addEventListener("resize", scheduleSync);
    document.addEventListener("visibilitychange", scheduleSync);
    sync();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", scheduleSync);
      window.removeEventListener("resize", scheduleSync);
      document.removeEventListener("visibilitychange", scheduleSync);
      sections.forEach((section) => section.classList.remove("is-offscreen"));
    };
  }, []);
}

const portfolioLinks = [...navItems, { label: "联系", href: "#contact" }];
const BG_IMAGE_1 = "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260609_195923_b0ba8ace-1d1d-4f2c-9a28-1ab84b330680.png&w=1280&q=85";
const BG_IMAGE_2 = "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260609_201152_bba90a12-bf12-459f-91f0-51f237dbaf3b.png&w=1280&q=85";
const SPOTLIGHT_R = 260;

function RevealLayer({ image, cursorX, cursorY }) {
  const canvasRef = useRef(null);
  const revealRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const reveal = revealRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !reveal || !context) return;

    const diameter = SPOTLIGHT_R * 2;
    canvas.width = diameter;
    canvas.height = diameter;
    const gradient = context.createRadialGradient(SPOTLIGHT_R, SPOTLIGHT_R, 0, SPOTLIGHT_R, SPOTLIGHT_R, SPOTLIGHT_R);
    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(0.4, "rgba(255,255,255,1)");
    gradient.addColorStop(0.6, "rgba(255,255,255,0.75)");
    gradient.addColorStop(0.75, "rgba(255,255,255,0.4)");
    gradient.addColorStop(0.88, "rgba(255,255,255,0.12)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    context.fillStyle = gradient;
    context.beginPath();
    context.arc(SPOTLIGHT_R, SPOTLIGHT_R, SPOTLIGHT_R, 0, Math.PI * 2);
    context.fill();

    const mask = `url(${canvas.toDataURL()})`;
    reveal.style.maskImage = mask;
    reveal.style.webkitMaskImage = mask;
  }, []);

  useEffect(() => {
    const reveal = revealRef.current;
    if (!reveal) return;
    const position = `${cursorX - SPOTLIGHT_R}px ${cursorY - SPOTLIGHT_R}px`;
    reveal.style.maskPosition = position;
    reveal.style.webkitMaskPosition = position;
  }, [cursorX, cursorY]);

  return (
    <>
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" style={{ display: "none" }} />
      <div
        ref={revealRef}
        className="absolute inset-0 bg-center bg-cover bg-no-repeat z-30 pointer-events-none"
        style={{
          backgroundImage: `url("${image}")`,
          maskSize: `${SPOTLIGHT_R * 2}px ${SPOTLIGHT_R * 2}px`,
          WebkitMaskSize: `${SPOTLIGHT_R * 2}px ${SPOTLIGHT_R * 2}px`,
          maskRepeat: "no-repeat",
          WebkitMaskRepeat: "no-repeat"
        }}
        aria-hidden="true"
      />
    </>
  );
}

function LithosNavigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="lithos-nav fixed top-0 left-0 right-0 z-[100] flex items-center justify-between p-4 sm:p-5" aria-label="网站导航">
      <a className="flex items-center gap-2" href="#home" aria-label="返回首页">
        <span className="portfolio-avatar" aria-hidden="true">
          <img src={assetUrl("images/avatar-hero.jpg")} alt="" width="80" height="80" fetchPriority="high" />
        </span>
      </a>

      <PillNav className="hidden md:flex absolute left-1/2 -translate-x-1/2" items={portfolioLinks} />

      <SpecularButton
        className="lithos-signup hidden md:inline-flex"
        href="#contact"
        size="sm"
        radius={999}
        tint="#ffffff"
        tintOpacity={0.92}
        baseColor="#ffffff"
        textColor="#111827"
        lineColor="#ffffff"
        followMouse
      >
        联系合作
      </SpecularButton>

      <SpecularButton
        className="mobile-menu-trigger md:hidden"
        size="sm"
        radius={999}
        tint="#ffffff"
        tintOpacity={0.1}
        baseColor="rgba(0,0,0,.28)"
        lineColor="#ffffff"
        autoAnimate={false}
        onClick={() => setMobileMenuOpen((open) => !open)}
        aria-expanded={mobileMenuOpen}
        aria-controls="lithos-mobile-menu"
        aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
      >
        {mobileMenuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
      </SpecularButton>

      {mobileMenuOpen ? (
        <div id="lithos-mobile-menu" className="absolute top-[72px] left-4 right-4 md:hidden rounded-2xl border border-white/20 bg-black/75 p-2 backdrop-blur-xl">
          {portfolioLinks.map((item) => (
            <SpecularButton
              key={item.href}
              href={item.href}
              className="mobile-menu-link"
              size="sm"
              radius={12}
              tint="#ffffff"
              tintOpacity={0.04}
              baseColor="transparent"
              lineColor="#ffffff"
              autoAnimate={false}
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.label}
            </SpecularButton>
          ))}
        </div>
      ) : null}
    </nav>
  );
}

function Hero({ isMobileLite }) {
  const heroRef = useRef(null);
  const mouse = useRef({ x: -999, y: -999 });
  const smooth = useRef({ x: -999, y: -999 });
  const rafRef = useRef(null);
  const [cursorPos, setCursorPos] = useState({ x: -999, y: -999 });

  useEffect(() => {
    const hero = heroRef.current;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!hero || !finePointer.matches) return undefined;

    let visible = false;
    const handleMouseMove = (event) => {
      mouse.current = { x: event.clientX, y: event.clientY };
    };

    const animate = () => {
      if (!visible) return;
      smooth.current.x += (mouse.current.x - smooth.current.x) * 0.1;
      smooth.current.y += (mouse.current.y - smooth.current.y) * 0.1;
      setCursorPos({ x: smooth.current.x, y: smooth.current.y });
      rafRef.current = requestAnimationFrame(animate);
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting && !document.hidden;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = visible ? requestAnimationFrame(animate) : null;
    });
    const handleVisibilityChange = () => {
      const rect = hero.getBoundingClientRect();
      visible = !document.hidden && rect.bottom > 0 && rect.top < window.innerHeight;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = visible ? requestAnimationFrame(animate) : null;
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    observer.observe(hero);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      observer.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <section
      ref={heroRef}
      className="lithos-hero relative w-full overflow-hidden h-screen tracking-[-0.02em]"
      id="home"
      data-cursor="home"
      style={{ height: "100dvh", fontFamily: "'Inter', sans-serif" }}
    >
      <div
        className="absolute inset-0 z-10 bg-center bg-cover bg-no-repeat hero-zoom"
        style={{ backgroundImage: `url("${BG_IMAGE_1}")` }}
        aria-hidden="true"
      />
      {!isMobileLite ? <RevealLayer image={BG_IMAGE_2} cursorX={cursorPos.x} cursorY={cursorPos.y} /> : null}
      <LithosNavigation />

      <div className="absolute top-[14%] left-0 right-0 z-50 flex flex-col items-center px-5 text-center pointer-events-none">
        <ParticleText
          className="hero-particle-text"
          text={`${profile.headline[0]}\n${profile.headline[1]}`}
          colors={["#ffffff", "#ffffff", "#ff815d", "#fff4ed"]}
          particleSize={1.75}
          particleGap={4}
          mouseControls={{ enabled: true, radius: 120, strength: 3.8 }}
          fontSize={118}
          autoFit
          lineScales={[1, 0.66]}
          letterSpacing={[0.06, 0.18]}
          lineGap={0.16}
          backgroundColor="transparent"
          friction={0.78}
          ease={0.055}
        />
      </div>

      <div
        className="hidden sm:block absolute z-50 bottom-14 left-10 md:left-14 max-w-[260px] hero-anim hero-fade"
        style={{ animationDelay: "0.7s" }}
      >
        <LineSidebar
          className="hero-proof-sidebar"
          items={["十五年电影发行经验", "七十部院线电影", "八十亿累计票房"]}
          accentColor="#A855F7"
          textColor="#c4c4c4"
          markerColor="#6c6c6c"
          showIndex
          showMarker
          proximityRadius={120}
          maxShift={24}
          falloff="smooth"
          markerLength={85}
          markerGap={0}
          tickScale={0.54}
          scaleTick
          itemGap={18}
          fontSize={1.1}
          smoothing={120}
          defaultActive={0}
          ariaLabel="核心履历数据"
        />
      </div>

      <div
        className="absolute z-50 bottom-10 sm:bottom-24 left-5 right-5 sm:left-auto sm:right-10 md:right-14 max-w-full sm:max-w-[260px] flex flex-col items-start gap-4 sm:gap-5 hero-anim hero-fade"
        style={{ animationDelay: "0.85s" }}
      >
        <Shuffle
          tag="p"
          className="text-xs sm:text-sm text-white/80 leading-relaxed hero-shuffle-copy"
          text={cleanText(profile.subline)}
          triggerOnHover
        />
        <SpecularButton
          className="hero-specular-cta"
          href="#about"
          size="md"
          radius={999}
          tint="#ff7b38"
          tintOpacity={0.92}
          baseColor="#c94e18"
          lineColor="#ffd1b7"
          followMouse
        >
          与王朝阳聊聊合作
        </SpecularButton>
      </div>
    </section>
  );
}

function SectionTitle({ title, text, titleNode }) {
  return (
    <header className="section-title" data-reveal>
      {titleNode || <h2>{title}</h2>}
      {text ? <p>{text}</p> : null}
    </header>
  );
}

const sectionRailItems = [
  { id: "about", label: "定位" },
  { id: "method", label: "方法" },
  { id: "projects", label: "项目" },
  { id: "services", label: "服务" },
  { id: "contact", label: "联系" }
];

function PortfolioRail() {
  const [activeSection, setActiveSection] = useState("about");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("home");
    const sections = sectionRailItems.map(({ id }) => document.getElementById(id)).filter(Boolean);
    const heroObserver = new IntersectionObserver(([entry]) => setIsVisible(!entry.isIntersecting), { threshold: 0.2 });
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        const current = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (current) setActiveSection(current.target.id);
      },
      { rootMargin: "-28% 0px -52%", threshold: [0.05, 0.2, 0.45] }
    );

    if (hero) heroObserver.observe(hero);
    sections.forEach((section) => sectionObserver.observe(section));
    return () => {
      heroObserver.disconnect();
      sectionObserver.disconnect();
    };
  }, []);

  return (
    <nav className={`portfolio-rail ${isVisible ? "is-visible" : ""}`} aria-label="长页章节导航">
      {sectionRailItems.map(({ id, label }, index) => (
        <a key={id} href={`#${id}`} className={activeSection === id ? "is-active" : ""} aria-current={activeSection === id ? "location" : undefined}>
          <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
          <strong>{label}</strong>
        </a>
      ))}
    </nav>
  );
}

function EditorialLead({ title, titleNode, text, align = "start" }) {
  return (
    <header className={`shell editorial-lead editorial-lead--${align}`} data-reveal="text">
      {titleNode || <h2>{title}</h2>}
      <p>{text}</p>
    </header>
  );
}

function PosterLightbox({ index, onClose, onMove }) {
  const closeButtonRef = useRef(null);
  const panelRef = useRef(null);
  const poster = cleanPosterArchive[index];

  useEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") onMove(-1);
      if (event.key === "ArrowRight") onMove(1);
      if (event.key === "Tab") {
        const controls = [...panelRef.current.querySelectorAll("button")];
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [onClose, onMove]);

  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={`${poster.title}电影海报大图`} onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <div className="lightbox-panel" ref={panelRef}>
        <div className="lightbox-head">
          <div><span>{String(index + 1).padStart(2, "0")} {cleanPosterArchive.length}</span><strong>{poster.title}</strong></div>
          <SpecularButton ref={closeButtonRef} className="lightbox-specular" size="sm" radius={999} autoAnimate={false} followMouse onClick={onClose}>关闭 <CloseIcon /></SpecularButton>
        </div>
        <div className="lightbox-media">
          <img src={poster.image} alt={`${poster.title}原版电影海报大图`} width="960" height="1440" />
        </div>
        <div className="lightbox-actions">
          <SpecularButton className="lightbox-specular" size="sm" radius={999} autoAnimate={false} followMouse onClick={() => onMove(-1)}><ArrowIcon direction="left" />上一张</SpecularButton>
          <SpecularButton className="lightbox-specular" size="sm" radius={999} autoAnimate={false} followMouse onClick={() => onMove(1)}>下一张<ArrowIcon /></SpecularButton>
        </div>
      </div>
    </div>
  );
}

function About() {
  return (
    <section className="section about positioning" id="about" data-cursor="about">
      <EditorialLead
        title="把电影级传播能力 迁移到 AI 时代"
        titleNode={
          <TrueFocus
            className="positioning-true-focus"
            segments={["把电影级传播能力", "迁移到 AI 时代"]}
            blurAmount={2.2}
            borderColor="#9a83ff"
            glowColor="rgba(126, 91, 255, .46)"
            animationDuration={0.62}
            pauseBetweenAnimations={1.35}
          />
        }
        text="以内容判断为起点 以传播战役为路径 让品牌表达最终进入真实增长"
      />
      <BorderGlow className="shell section-master-visual positioning-master-visual" borderRadius={18} glowRadius={54} glowIntensity={1.55}>
        <figure data-reveal="media">
          <img src={assetUrl("images/visuals/positioning-master-visual-v3.png")} alt="王朝阳传播增长顾问定位主视觉" width="1672" height="941" loading="lazy" />
        </figure>
      </BorderGlow>
      <div className="shell positioning-capabilities" data-reveal="collection">
        <LineSidebar
          className="capability-list"
          items={cleanCapabilities}
          accentColor="#A855F7"
          textColor="#c4c4c4"
          markerColor="#6c6c6c"
          showIndex
          showMarker
          proximityRadius={120}
          maxShift={24}
          falloff="smooth"
          markerLength={85}
          markerGap={0}
          tickScale={0.54}
          scaleTick
          itemGap={18}
          fontSize={1.1}
          smoothing={120}
          defaultActive={0}
          ariaLabel="核心能力"
        />
      </div>
    </section>
  );
}

function Statement({ isMobileLite }) {
  const methodSteps = [
    {
      icon: Brain,
      title: "理解人",
      text: "找到值得说的事",
      label: "内容判断流程",
      note: "从业务目标和受众情绪中提炼真正值得传播的内容母题",
      flow: ["业务目标", "受众情绪", "内容母题", "表达原则"]
    },
    {
      icon: Megaphone,
      title: "组织情绪",
      text: "把内容变成战役",
      label: "传播战役流程",
      note: "把内容母题组织成有节奏 有触点 有扩散机制的传播战役",
      flow: ["价值母题", "预热蓄水", "核心引爆", "口碑扩散", "资产沉淀"]
    },
    {
      icon: TrendingUp,
      title: "形成行动",
      text: "让传播进入增长",
      label: "增长转化流程",
      note: "把传播结果沉淀为品牌认知 有效线索和商业转化",
      flow: ["内容触达", "有效互动", "线索沉淀", "商业转化", "复盘迭代"]
    }
  ];
  const [activeMethod, setActiveMethod] = useState(0);
  const ActiveMethodIcon = methodSteps[activeMethod].icon;

  return (
    <section className="section statement method" id="method" data-cursor="method">
      {!isMobileLite ? (
        <div className="method-shape-blur" aria-hidden="true">
          <ShapeBlur variation={1} pixelRatio={1} />
        </div>
      ) : null}
      <div className="shell method-layout">
        <h2 className="method-chrome-title" data-reveal="text">
          <span>从电影判断</span>
          <span>到增长系统</span>
        </h2>
        <div className="method-system">
        <div className="method-tabs" role="tablist" aria-label="传播增长方法" data-reveal="collection">
            {methodSteps.map((step, index) => {
              const StepIcon = step.icon;
              return (
              <SpecularButton
                key={step.title}
                role="tab"
                aria-selected={activeMethod === index}
                aria-controls="method-panel"
                className={`method-specular-tab${activeMethod === index ? " is-active" : ""}`}
                size="lg"
                radius={48}
                tint="#d21b1b"
                tintOpacity={0.08}
                blur={26}
                textColor="#f5f5f5"
                lineColor="#ffffff"
                baseColor="#e1c2c2"
                intensity={3}
                shineSize={20}
                shineFade={40}
                thickness={1}
                speed={1.05}
                followMouse
                proximity={390}
                autoAnimate={false}
                onClick={() => setActiveMethod(index)}
              >
                <span className="method-tab-content">
                  <StepIcon aria-hidden="true" />
                  <strong>{step.title}</strong>
                  <p>{step.text}</p>
                </span>
              </SpecularButton>
            );})}
        </div>
        <div className="method-media" data-reveal="media">
          <figure className="method-artifact">
            <img src={assetUrl("images/visuals/method-emotion-form.png")} alt="粉蓝色半透明软体装置" width="1586" height="992" loading="lazy" />
            {!isMobileLite ? <div className="method-magic-rings"><MagicRings /></div> : null}
            <figcaption>找到值得说的事</figcaption>
          </figure>
          <div id="method-panel" role="tabpanel" className="method-evidence" tabIndex="0" key={methodSteps[activeMethod].title}>
            <ActiveMethodIcon aria-hidden="true" />
            <strong>{methodSteps[activeMethod].label}</strong>
            <div className="method-flowchart" aria-label={methodSteps[activeMethod].label}>
              {methodSteps[activeMethod].flow.map((item, index) => (
                <React.Fragment key={item}>
                  <BorderGlow
                    as="div"
                    className="method-flow-node"
                    edgeSensitivity={80}
                    glowColor="40 80 80"
                    backgroundColor="#120F17"
                    borderRadius={48}
                    glowRadius={69}
                    glowIntensity={2.6}
                    coneSpread={45}
                    animated
                    colors={["#c084fc", "#f472b6", "#38bdf8"]}
                  >
                    <b>{item}</b>
                  </BorderGlow>
                  {index < methodSteps[activeMethod].flow.length - 1 ? <i aria-hidden="true" /> : null}
                </React.Fragment>
              ))}
            </div>
            <p>{methodSteps[activeMethod].note}</p>
          </div>
        </div>
        </div>
      </div>
    </section>
  );
}

function Projects({ isMobileLite }) {
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const moveLightbox = useCallback((direction) => {
    setLightboxIndex((current) => (current + direction + cleanPosterArchive.length) % cleanPosterArchive.length);
  }, []);

  return (
    <section className="section projects" id="projects" data-cursor="projects">
      {!isMobileLite ? <FluidGlass className="projects-fluid-glass" scale={0.72} ior={1.18} thickness={2.8} chromaticAberration={0.08} /> : null}
      <div className="shell projects-layout">
        <div className="project-accordion-intro" data-reveal>
          <SectionTitle
            title="市场会忘记噪音 但会记住真正的共鸣"
            titleNode={
              <SplitText
                tag="h2"
                className="project-split-title"
                text="市场会忘记噪音 但会记住真正的共鸣"
                splitType="chars"
                delay={42}
                duration={1.05}
                ease="power4.out"
                from={{ opacity: 0, y: 54, rotateX: -70, filter: "blur(8px)" }}
                to={{ opacity: 1, y: 0, rotateX: 0, filter: "blur(0px)" }}
                threshold={0.16}
                rootMargin="-50px"
                textAlign="left"
              />
            }
            text="这些项目不是履历陈列 而是传播判断被真实市场检验过的证据 理解观众 组织情绪 建立口碑 再把注意力转化为结果"
          />
        </div>
        <div className="projects-accordion-gallery" data-reveal="media">
          <AccordionGallery items={cleanFilmProjects} />
        </div>
        <div className="projects-drift-wall" data-reveal="collection">
          <DriftWall
            items={driftWallItems}
            staticMode={isMobileLite}
            columns={5}
            tileWidth={200}
            tileHeight={132}
            gap={18}
            tilt={16}
            turn={-14}
            perspective={1200}
            depth={120}
            speed={42}
            direction="up"
            variance={0.45}
            parallax={0.6}
            lift={64}
            fade={0.6}
            dim={0.55}
            overlayColor="#060010"
            radius={14}
            roll={0}
            pauseOnHover={false}
            grayscale={false}
            onItemClick={(_, index, event) => {
              event.preventDefault();
              setLightboxIndex(index);
            }}
          />
        </div>
      </div>
      {lightboxIndex !== null ? <PosterLightbox index={lightboxIndex} onClose={closeLightbox} onMove={moveLightbox} /> : null}
    </section>
  );
}

function Services({ isMobileLite }) {
  const aiContentFlow = [
    ["01", "品牌知识库", "品牌规范 产品资料 内容资产"],
    ["02", "目标与洞察", "业务目标 受众情绪 渠道信号"],
    ["03", "AI 内容策划", "内容母题 选题矩阵 生产任务"],
    ["04", "多模态生成", "文案 图片 视频 渠道变体"],
    ["05", "人工审核", "事实核验 品牌合规 发布审批"],
    ["06", "矩阵分发", "渠道适配 排期发布 资产归档"],
    ["07", "数据回流", "表现分析 经验沉淀 持续优化"]
  ];
  return (
    <section className="section services" id="services" data-cursor="services">
      <EditorialLead
        title="把一次创意 变成持续运转的增长系统"
        titleNode={
          <h2 className="services-rotating-title" aria-label="把一次创意 变成持续运转的增长系统">
            <span>把一次创意 变成</span>
            <span className="services-rotating-line">
              <RotatingText className="services-rotating-word" texts={["持续运转", "稳定复用", "规模增长"]} rotationInterval={2400} />
              <span>的增长系统</span>
            </span>
          </h2>
        }
        text="从品牌知识库到数据回流 将内容策略 生产 审核 分发和复盘连接为可复用的企业能力"
        align="offset"
      />
      <BorderGlow className="shell section-master-visual services-master-visual" borderRadius={18} glowRadius={56} glowIntensity={1.65}>
      <figure data-reveal="media">
        <img src={assetUrl("images/visuals/services-master-visual.png")} alt="增长服务系统主视觉" width="1707" height="960" loading="lazy" />
        {!isMobileLite ? <div className="enterprise-ai-shape-frame" aria-hidden="true"><ShapeBlur variation={1} pixelRatio={1} /></div> : null}
        <BorderGlow
          className="enterprise-ai-flow-glow"
          edgeSensitivity={80}
          glowColor="40 80 80"
          backgroundColor="#120F17"
          borderRadius={48}
          glowRadius={69}
          glowIntensity={2.6}
          coneSpread={45}
          animated
          colors={["#c084fc", "#f472b6", "#38bdf8"]}
        >
          <div className="enterprise-ai-flow" aria-label="企业 AI 内容工作流程图">
            <strong>企业 AI 内容闭环</strong>
            <div className="enterprise-ai-flow__track">
              {aiContentFlow.map(([index, title, text], itemIndex) => (
                <React.Fragment key={title}>
                  <MagicBentoFrame as="article" tabIndex="0" glowColor="154, 131, 255">
                    <span>{index}</span>
                    <div><b>{title}</b><small>{text}</small></div>
                  </MagicBentoFrame>
                  {itemIndex < aiContentFlow.length - 1 ? <i aria-hidden="true" /> : null}
                </React.Fragment>
              ))}
            </div>
          </div>
        </BorderGlow>
      </figure>
      </BorderGlow>
    </section>
  );
}

function Contact() {
  const cooperation = [
    ["品牌传播", "从品牌主张到年度传播战役"],
    ["企业 AI 内容体系", "从内容母题到生产分发系统"],
    ["创始人 IP", "从专业能力到持续公共表达"],
    ["影视文旅项目", "从项目判断到市场传播落地"]
  ];
  return (
    <section className="contact contact-capsule-section" id="contact" data-cursor="contact">
      <div className="shell contact-capsule" data-reveal="media">
        <img src={assetUrl("images/visuals/contact-capsule-landscape.png")} alt="未来感荒漠胶囊建筑" width="1915" height="821" loading="lazy" />
        <div className="contact-capsule__shade" aria-hidden="true" />
        <div className="contact-capsule__head">
          <span>从一个具体问题开始</span>
          <SpecularButton href={`tel:${profile.phone}`} size="md" radius={999} lineColor="#ffad45">联系王朝阳 <ArrowUpRight /></SpecularButton>
        </div>
        <div className="contact-scroll-title" role="heading" aria-level="2" aria-label="内容被看见之前 先要值得被相信">
          <ScrollVelocity
            texts={["内容被看见之前", "先要值得被相信"]}
            velocity={24}
            damping={48}
            stiffness={360}
            numCopies={5}
            velocityMapping={{ input: [0, 900], output: [0, 4.5] }}
            className="contact-scroll-line"
          />
        </div>
        <p>如果你正在重新定义品牌表达 搭建 AI 内容体系 或推动一个需要被市场理解的项目 我们可以从一个具体问题开始</p>
        <div className="contact-capsule__cooperation">
          {cooperation.map(([title, text]) => (
            <MagicBentoFrame as="article" key={title} tabIndex="0" glowColor="255, 177, 78">
              <BorderGlow
                className="contact-cooperation-glow"
                edgeSensitivity={80}
                glowColor="40 80 80"
                backgroundColor="#120F17"
                borderRadius={48}
                glowRadius={69}
                glowIntensity={2.6}
                coneSpread={45}
                animated
                colors={["#c084fc", "#f472b6", "#38bdf8"]}
              >
                <strong>{title}</strong><span>{text}</span>
              </BorderGlow>
            </MagicBentoFrame>
          ))}
        </div>
      </div>
      <footer className="shell"><strong>王朝阳</strong><a href={`tel:${profile.phone}`}>{profile.phone}</a></footer>
    </section>
  );
}

function App() {
  useReveal();
  usePauseOffscreenAnimations();
  const isMobileLite = useMediaQuery("(max-width: 760px), (hover: none) and (pointer: coarse)");
  return <>
    <a className="skip-link" href="#main-content">跳至主要内容</a>
    {!isMobileLite ? (
      <SplashCursor
        SIM_RESOLUTION={96}
        DYE_RESOLUTION={720}
        DENSITY_DISSIPATION={3.8}
        VELOCITY_DISSIPATION={2.2}
        CURL={4}
        SPLAT_RADIUS={0.16}
        SPLAT_FORCE={4200}
        COLOR_UPDATE_SPEED={7}
        TRANSPARENT
        RAINBOW_MODE
      />
    ) : null}
    <div className={`site-ballpit-background${isMobileLite ? " site-ballpit-background--static" : ""}`} aria-hidden="true">
      {!isMobileLite ? (
        <Ballpit
          count={100}
          gravity={0.01}
          friction={0.9975}
          wallBounce={0.95}
          followCursor={false}
        />
      ) : null}
    </div>
    <Hero isMobileLite={isMobileLite} />
    <PortfolioRail />
    <main id="main-content"><About /><Statement isMobileLite={isMobileLite} /><Projects isMobileLite={isMobileLite} /><Services isMobileLite={isMobileLite} /><Contact /></main>
  </>;
}

createRoot(document.getElementById("root")).render(<App />);
