import { FaqClient } from "./faq-client";
import { ContactCtaPanel, ContactActionsStrip } from "./contact-cta-panel";

interface FaqSectionProps {
  t: (key: string) => string;
}

const FAQ_COUNT = 15;
const INITIAL_VISIBLE = 5;
const FOOTER_EMAIL = "info@rasi.sa";
const COMPANY_ADDRESS = "3286 al khaboob st, Al Malqa, Riyadh 13521";

export function FaqSection({ t }: FaqSectionProps) {
  const faqs = Array.from({ length: FAQ_COUNT }, (_, i) => ({
    q: t(`faqSection.items.${i}.q`),
    a: t(`faqSection.items.${i}.a`),
  }));

  const channels: { icon: "form" | "email" | "hours" | "operator"; label: string; value: string }[] = [
    { icon: "form", label: t("contactSection.ch1Label"), value: t("contactSection.ch1Value") },
    { icon: "email", label: t("contactSection.ch2Label"), value: FOOTER_EMAIL },
    { icon: "hours", label: t("contactSection.ch3Label"), value: t("contactSection.ch3Value") },
    { icon: "operator", label: t("contactSection.ch4Label"), value: COMPANY_ADDRESS },
  ];

  return (
    <section className="md:!py-8 !py-4"
      id="faq-contact-section"
      style={{
        background: "linear-gradient(180deg, var(--brand-white) 0%, var(--brand-ivory) 100%)",
        borderTop: "1px solid var(--brand-ivory-dark)",
      }}
    >
      <div
        className="container-app"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "2rem",
        }}
      >
        {/* Top — FAQ + Get Started panel */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "2.5rem",
            alignItems: "start",
          }}
          className="faq-grid"
        >
          {/* FAQ column */}
          <FaqClient
            badge={t("faqSection.badge")}
            title={t("faqSection.title")}
            showMore={t("faqSection.showMore")}
            showLess={t("faqSection.showLess")}
            faqs={faqs}
            initialVisible={INITIAL_VISIBLE}
          />

          {/* Contact column */}
          <ContactCtaPanel
            badge={t("contactSection.badge")}
            headline={t("contactSection.headline")}
            copy={t("contactSection.copy")}
            formTitle={t("contactSection.formTitle")}
            fieldName={t("contactSection.fieldName")}
            fieldEmail={t("contactSection.fieldEmail")}
            fieldMessage={t("contactSection.fieldMessage")}
            fieldMessagePlaceholder={t("contactSection.fieldMessagePlaceholder")}
            submit={t("contactSection.submit")}
            submitSending={t("contactSection.submitSending")}
            submitSuccess={t("contactSection.submitSuccess")}
          />
        </div>

        {/* Bottom — full-width "How to reach us" + CTAs */}
        <ContactActionsStrip
          channelsTitle={t("contactSection.channelsTitle")}
          channels={channels}
          ctaOwner={t("contactSection.ctaOwner")}
          ctaPro={t("contactSection.ctaPro")}
          ctaSupport={t("contactSection.ctaSupport")}
        />
      </div>

      <style>{`
        @media (max-width: 900px) {
          .faq-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
