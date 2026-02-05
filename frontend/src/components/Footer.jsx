function Footer() {
  return (
    <footer className="w-full border-t-2 border-rose-200 bg-white/60 py-6 mt-8">
      <div className="max-w-5xl mx-auto px-4 text-center text-sm text-neutral-600">
        <p className="font-light">
          © {new Date().getFullYear()} Besedotvorje | Vse pravice pridržane.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
