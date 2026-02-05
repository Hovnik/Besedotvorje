function DecorativeElements() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Left side decorations */}
      <div className="absolute left-0 top-0 bottom-0 w-48 opacity-20">
        <div className="absolute top-20 left-8 text-6xl text-rose-900 rotate-12">
          "
        </div>
        <div className="absolute top-40 left-4 text-4xl text-amber-700">§</div>
        <div className="absolute top-60 left-12 text-5xl text-rose-800">¶</div>
        <div className="absolute top-80 left-6 text-3xl text-amber-600">❧</div>
        <div className="absolute bottom-60 left-10 text-6xl text-rose-700">
          „
        </div>
        <div className="absolute bottom-40 left-4 text-4xl text-amber-800">
          ✎
        </div>
        <div className="absolute bottom-20 left-8 text-5xl text-rose-900">
          *
        </div>
      </div>

      {/* Right side decorations */}
      <div className="absolute right-0 top-0 bottom-0 w-48 opacity-20">
        <div className="absolute top-32 right-8 text-6xl text-rose-900 -rotate-12">
          "
        </div>
        <div className="absolute top-52 right-12 text-4xl text-amber-700">
          ¶
        </div>
        <div className="absolute top-72 right-6 text-5xl text-rose-800">§</div>
        <div className="absolute top-96 right-10 text-3xl text-amber-600">
          ✦
        </div>
        <div className="absolute bottom-72 right-8 text-6xl text-rose-700">
          "
        </div>
        <div className="absolute bottom-48 right-12 text-4xl text-amber-800">
          ❦
        </div>
        <div className="absolute bottom-24 right-6 text-5xl text-rose-900">
          ~
        </div>
      </div>
    </div>
  );
}

export default DecorativeElements;
