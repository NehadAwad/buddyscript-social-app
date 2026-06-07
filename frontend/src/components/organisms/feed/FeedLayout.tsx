"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, logout } from "@/lib/auth";
import type { PublicUser } from "@/types/auth";
import { FeedShellStatic } from "./FeedShellStatic";
import { FeedSidebarLeft } from "./FeedSidebarLeft";
import { FeedSidebarRight } from "./FeedSidebarRight";
import { FeedMiddleColumn } from "./FeedMiddleColumn";

function ColdStartMessage() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        textAlign: "center",
        padding: 24,
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          border: "4px solid #e0e0e0",
          borderTopColor: "#1890ff",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <h4 style={{ marginTop: 24, fontSize: 18, fontWeight: 600, color: "#333" }}>
        Waking up the server...
      </h4>
      <p style={{ marginTop: 8, fontSize: 14, color: "#666", maxWidth: 300 }}>
        This may take 10-30 seconds on the first visit. The server sleeps when inactive to save resources.
      </p>
    </div>
  );
}

function bindDropdownToggle(buttonSelector: string, menuSelector: string) {
  const button = document.querySelector<HTMLElement>(buttonSelector);
  const menu = document.querySelector<HTMLElement>(menuSelector);

  if (!button || !menu) {
    return undefined;
  }

  const handler = () => {
    menu.classList.toggle("show");
  };

  button.addEventListener("click", handler);
  return () => button.removeEventListener("click", handler);
}

function applyUserToShell(user: PublicUser) {
  const displayName = `${user.firstName} ${user.lastName}`;
  const avatar = user.avatarUrl || "/images/profile.png";

  document.querySelectorAll("._header_nav_para").forEach((el) => {
    el.textContent = displayName;
  });

  document.querySelectorAll("._nav_dropdown_title").forEach((el) => {
    el.textContent = displayName;
  });

  document
    .querySelectorAll("._nav_profile_img, ._nav_drop_img, ._txt_img")
    .forEach((el) => {
      if (el instanceof HTMLImageElement) {
        el.src = avatar;
      }
    });
}

export function FeedLayout() {
  const router = useRouter();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [showColdStart, setShowColdStart] = useState(false);

  useEffect(() => {
    const coldStartTimer = setTimeout(() => {
      setShowColdStart(true);
    }, 3000);

    getCurrentUser()
      .then((fetchedUser) => {
        clearTimeout(coldStartTimer);
        setShowColdStart(false);
        setUser(fetchedUser);
      })
      .catch(() => {
        clearTimeout(coldStartTimer);
        router.replace("/login");
      });

    return () => clearTimeout(coldStartTimer);
  }, [router]);

  useEffect(() => {
    if (!user) {
      return;
    }

    applyUserToShell(user);

    const cleanups = [
      bindDropdownToggle("#_profile_drop_show_btn", "#_prfoile_drop"),
      bindDropdownToggle("#_notify_btn", "#_notify_drop"),
    ];

    const logoutLinks = document.querySelectorAll("._nav_dropdown_link");
    const logoutHandler = async (event: Event) => {
      const target = event.currentTarget as HTMLElement;
      if (!target.textContent?.includes("Log Out")) {
        return;
      }

      event.preventDefault();
      try {
        await logout();
      } finally {
        router.replace("/login");
        router.refresh();
      }
    };

    logoutLinks.forEach((link) => {
      if (link.textContent?.includes("Log Out")) {
        link.addEventListener("click", logoutHandler);
      }
    });

    return () => {
      cleanups.forEach((cleanup) => cleanup?.());
      logoutLinks.forEach((link) => {
        if (link.textContent?.includes("Log Out")) {
          link.removeEventListener("click", logoutHandler);
        }
      });
    };
  }, [user, router]);

  if (!user) {
    if (showColdStart) {
      return <ColdStartMessage />;
    }
    return null;
  }

  return (
    <div
      className={`_layout _layout_main_wrapper${darkMode ? " _dark_wrapper" : ""}`}
    >
      <div className="_layout_mode_swithing_btn">
        <button
          type="button"
          className="_layout_swithing_btn_link"
          onClick={() => setDarkMode((value) => !value)}
        >
          <div className="_layout_swithing_btn">
            <div className="_layout_swithing_btn_round" />
          </div>
          <div className="_layout_change_btn_ic1">
            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="16" fill="none" viewBox="0 0 11 16">
              <path
                fill="#fff"
                d="M2.727 14.977l.04-.498-.04.498zm-1.72-.49l.489-.11-.489.11zM3.232 1.212L3.514.8l-.282.413zM9.792 8a6.5 6.5 0 00-6.5-6.5v-1a7.5 7.5 0 017.5 7.5h-1zm-6.5 6.5a6.5 6.5 0 006.5-6.5h1a7.5 7.5 0 01-7.5 7.5v-1zm-.525-.02c.173.013.348.02.525.02v1c-.204 0-.405-.008-.605-.024l.08-.997zm-.261-1.83A6.498 6.498 0 005.792 7h1a7.498 7.498 0 01-3.791 6.52l-.495-.87zM5.792 7a6.493 6.493 0 00-2.841-5.374L3.514.8A7.493 7.493 0 016.792 7h-1zm-3.105 8.476c-.528-.042-.985-.077-1.314-.155-.316-.075-.746-.242-.854-.726l.977-.217c-.028-.124-.145-.09.106-.03.237.056.6.086 1.165.131l-.08.997zm.314-1.956c-.622.354-1.045.596-1.31.792a.967.967 0 00-.204.185c-.01.013.027-.038.009-.12l-.977.218a.836.836 0 01.144-.666c.112-.162.27-.3.433-.42.324-.24.814-.519 1.41-.858L3 13.52zM3.292 1.5a.391.391 0 00.374-.285A.382.382 0 003.514.8l-.563.826A.618.618 0 012.702.95a.609.609 0 01.59-.45v1z"
              />
            </svg>
          </div>
          <div className="_layout_change_btn_ic2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="4.389" stroke="#fff" transform="rotate(-90 12 12)" />
              <path
                stroke="#fff"
                strokeLinecap="round"
                d="M3.444 12H1M23 12h-2.444M5.95 5.95L4.222 4.22M19.778 19.779L18.05 18.05M12 3.444V1M12 23v-2.445M18.05 5.95l1.728-1.729M4.222 19.779L5.95 18.05"
              />
            </svg>
          </div>
        </button>
      </div>

      <FeedShellStatic />

      <div className="container _custom_container">
        <div className="_layout_inner_wrap">
          <div className="row">
            <FeedSidebarLeft />
            <FeedMiddleColumn user={user} />
            <FeedSidebarRight />
          </div>
        </div>
      </div>
    </div>
  );
}
