"use client";;import { useTranslation } from "react-i18next";;export function Hero() {;const { t } = useTranslation();
  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">{t("hero.welcome_to_our_amazing_platform")}

          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">{t("hero.experience_the_future_of_web_development_with_our_innovative_tools_and_solutions_start_your_journey_today_and_build_something_extraordinary")}


          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <a href="#" className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">{t("hero.get_started")}

            </a>
            <a href="#" className="text-sm font-semibold leading-6 text-gray-900">{t("hero.learn_more")}
              <span aria-hidden="true">{t("hero.")}</span>
            </a>
          </div>
        </div>
      </div>
    </div>);

}