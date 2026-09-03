import React from "react";

const Footer = () => {
  const footerColumns = [
    {
      title: "Product",
      links: [
        { label: "How It Works", href: "#" },
        { label: "Features", href: "#" },
        { label: "Roadmap", href: "#" },
      ],
    },
    {
      title: "Community",
      links: [
        { label: "Leaderboard", href: "#" },
        { label: "Community Guidelines", href: "#" },
        { label: "Discord", href: "#" },
      ],
    },
    {
      title: "Support",
      links: [
        { label: "FAQ", href: "#" },
        { label: "Report a Bug", href: "#" },
        { label: "Request a Feature", href: "#" },
      ],
    },
    {
      title: "Developer",
      links: [
        {
          label: "GitHub",
          href: "https://github.com/arpusauri/habit-daily-quest",
        },
        {
          label: "Release Notes",
          href: "https://github.com/arpusauri/habit-daily-quest/releases",
        },
      ],
    },
  ];

  const socialLinks = [
    { label: "GitHub", href: "https://github.com/arpusauri", icon: "GH" },
    { label: "Instagram", href: "#", icon: "IG" },
  ];

  return (
    <footer className="w-full bg-gray-100 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Grid Columns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8">
          {footerColumns.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-black text-[#1e720f] mb-3">
                {col.title}
              </h3>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target={
                        link.href.startsWith("http") ? "_blank" : undefined
                      }
                      rel={
                        link.href.startsWith("http")
                          ? "noopener noreferrer"
                          : undefined
                      }
                      className="text-sm text-gray-600 hover:text-[#51b330] transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Social Column */}
          <div>
            <h3 className="text-sm font-black text-[#1e720f] mb-3">Social</h3>
            <ul className="space-y-2">
              {socialLinks.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target={
                      social.href.startsWith("http") ? "_blank" : undefined
                    }
                    rel={
                      social.href.startsWith("http")
                        ? "noopener noreferrer"
                        : undefined
                    }
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#51b330] transition-colors"
                  >
                    <span className="w-6 h-6 rounded-md bg-white border border-gray-300 flex items-center justify-center text-[9px] font-black text-gray-500 shrink-0">
                      {social.icon}
                    </span>
                    {social.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Gambit. All rights reserved.
          </p>

          <div className="flex items-center gap-6">
            <a
              href="#"
              className="text-xs text-gray-500 hover:text-[#51b330] transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-xs text-gray-500 hover:text-[#51b330] transition-colors"
            >
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
