import { SeoContent } from '../../seo/routes';

type SeoContentBlockProps = {
  content?: SeoContent;
};

export function SeoContentBlock({ content }: SeoContentBlockProps) {
  if (!content) {
    return null;
  }

  return (
    <section className="mx-auto mt-10 w-[min(1200px,100%)] rounded-3xl border border-dark-border bg-dark-card/80 px-6 py-8 max-lg:mt-8 max-md:px-5 max-md:py-6">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-2xl font-semibold tracking-tight text-white max-md:text-xl">{content.heading}</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-text-secondary">{content.intro}</p>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {content.sections.map((section) => (
            <article key={section.title} className="rounded-2xl border border-white/8 bg-black/10 p-5">
              <h3 className="text-lg font-semibold text-white">{section.title}</h3>
              <div className="mt-3 space-y-3 text-sm leading-7 text-text-secondary">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              {section.bullets && (
                <ul className="mt-4 space-y-2 text-sm leading-6 text-text-secondary">
                  {section.bullets.map((bullet) => (
                    <li key={bullet} className="flex gap-2">
                      <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-brand" aria-hidden="true" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </div>

        {content.faqs && content.faqs.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-white">Frequently asked questions</h3>
            <div className="mt-4 grid gap-4">
              {content.faqs.map((faq) => (
                <article key={faq.question} className="rounded-2xl border border-white/8 bg-black/10 p-5">
                  <h4 className="text-base font-semibold text-white">{faq.question}</h4>
                  <p className="mt-2 text-sm leading-7 text-text-secondary">{faq.answer}</p>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
