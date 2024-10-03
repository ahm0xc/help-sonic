"use client";

import { Cookie } from "lucide-react";
import useLocalStorage from "use-local-storage";

import { Button } from "./ui/button";
import { useEffect, useState } from "react";

export default function CookieBanner() {
  const [isCookieChecked, setIsCookieChecked] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  function allowCookie() {
    window.localStorage.setItem("is-cookie-checked", "true");
    setIsCookieChecked(true);
  }

  function denyCookie() {
    window.localStorage.setItem("is-cookie-checked", "true");
    setIsCookieChecked(true);
  }

  useEffect(() => {
    const _isCookieChecked = window.localStorage.getItem("is-cookie-checked");

    setIsCookieChecked(Boolean(_isCookieChecked));
    setIsLoading(false);
  }, []);

  if (isCookieChecked || isLoading) return;

  return (
    <div className="fixed bottom-6 right-6">
      <div className="flex items-center bg-neutral-100 border rounded-2xl p-4 gap-3">
        <div className="h-10 w-10 rounded-full bg-neutral-200 text-neutral-600 grid place-content-center">
          <Cookie className="h-6 w-6" />
        </div>
        <div className="max-w-[300px]">
          <p>
            We use third party cookies in order to personalize your site
            experience.
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            className="bg-neutral-300 text-neutral-800 rounded-l-full pl-6 hover:bg-neutral-300/90"
            onClick={denyCookie}
          >
            Deny
          </Button>
          <Button
            onClick={allowCookie}
            className="rounded-l-xl rounded-r-full pr-6"
          >
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}
