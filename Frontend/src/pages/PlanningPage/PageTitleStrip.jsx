import { useNavigate } from "react-router-dom";
import { HiOutlineArrowLeft } from "react-icons/hi2";

// ============================================================
// Page-level full-width title strip for the desktop production UI.
//
// Everything in the 44px bar is vertically centered on a single
// flex axis — the back button, the eyebrow/title/subtitle block,
// and every action — so nothing drifts up/down regardless of how
// much text a page passes in.
//
// Back button ALWAYS steps back through browser/router history
// (navigate(-1)), never a hardcoded route, so it reliably returns
// the user to wherever they actually came from.
// ============================================================
export default function PageTitleStrip({ eyebrow, title, subtitle, showBack = true, actions }) {
  const navigate = useNavigate();

  return (
    <header className="w-full border-b border-[#C6C6C6] bg-white">
      {/* Gradient accent line */}
      <div
        className="h-[2px] w-full"
        style={{ background: "linear-gradient(90deg, #0F1D24 0%, #C6C6C6 50%, #FDC94D 100%)" }}
      />

      <div className="flex h-11 w-full items-center justify-between gap-3 px-3">
        {/* Left: back button + heading block — single centered row */}
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          {showBack && (
            <button
              type="button"
              onClick={() => navigate(-1)}
              title="Back"
              aria-label="Go back"
              className="flex h-7 w-7 shrink-0 items-center justify-center border border-[#C6C6C6] bg-white p-0 leading-none text-[#0F1D24] outline-none transition-colors duration-100 hover:border-[#0F1D24] hover:bg-[#0F1D24] hover:text-[#FDC94D] focus-visible:ring-2 focus-visible:ring-[#FDC94D] focus-visible:ring-offset-1"
            >
              <HiOutlineArrowLeft className="h-3.5 w-3.5 shrink-0" />
            </button>
          )}

          <div
            className={`flex min-w-0 flex-1 flex-col justify-center gap-0.5 ${
              showBack ? "border-l border-[#C6C6C6] pl-2.5" : ""
            }`}
          >
            <div className="flex items-baseline gap-2">
              {eyebrow && (
                <span className="shrink-0 text-[10px] font-bold uppercase leading-none tracking-wider text-[#0F1D24]/60">
                  {eyebrow}
                </span>
              )}
              <h1 className="truncate text-[13px] font-bold leading-none tracking-tight text-[#0F1D24]">
                {title}
              </h1>
            </div>
            {subtitle && (
              <p className="truncate font-mono text-[10px] leading-none text-[#9B9B9B]">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Right: action button group — same fixed height, gap-line trick */}
        {actions && (
          <div className="flex h-7 shrink-0 items-stretch gap-px bg-[#C6C6C6] [&>*]:flex [&>*]:items-center [&>*]:whitespace-nowrap">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}