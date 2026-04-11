'use client'

import Link from 'next/link'

export default function MobileFAB() {
  return (
    <>
      <style>{`
        .fab {
          position: fixed;
          bottom: 1.5rem;
          right: 1.25rem;
          width: 58px;
          height: 58px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          z-index: 60;

          background: linear-gradient(135deg, #ec4899, #fb923c);
          color: #fff;

          box-shadow:
            0 10px 30px rgba(236, 72, 153, 0.35),
            0 2px 8px rgba(0, 0, 0, 0.08);

          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .fab:active {
          transform: scale(0.9);
          box-shadow:
            0 6px 18px rgba(236, 72, 153, 0.25),
            0 1px 4px rgba(0, 0, 0, 0.08);
        }

        /* subtle pulse (very important for addiction loop) */
        .fab::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: inherit;
          opacity: 0.25;
          filter: blur(8px);
          z-index: -1;
        }

        @media (min-width: 1024px) {
          .fab {
            display: none !important;
          }
        }
      `}</style>

      <Link href="/create" className="fab">
        <span
          className="material-symbols-outlined mat-fill"
          style={{ fontSize: 28 }}
        >
          add
        </span>
      </Link>
    </>
  )
}