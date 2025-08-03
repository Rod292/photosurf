'use client'

import Image from 'next/image'
import { LanguageSwitcher } from '@/components/language-switcher'
import { getTranslation, Language } from '@/lib/translations'

interface GalleryInstructionsProps {
  language: Language
  onLanguageChange: (lang: Language) => void
}

export function GalleryInstructions({ language, onLanguageChange }: GalleryInstructionsProps) {
  const t = getTranslation(language)

  return (
    <div className="bg-gray-50 py-6">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-4 mb-6">
            <h2 className="text-xl md:text-2xl font-bold font-dm-sans">
              {t.howToFind.title}
            </h2>
            <LanguageSwitcher 
              currentLanguage={language}
              onLanguageChange={onLanguageChange}
            />
          </div>
          
          {/* Desktop version */}
          <div className="hidden md:grid md:grid-cols-3 gap-4">
            <div className="bg-white p-3 rounded-lg shadow-md">
              <div className="flex justify-center mb-2">
                <Image
                  src="/Logos/Calendar.svg"
                  alt="Calendar"
                  width={32}
                  height={32}
                  className="w-8 h-8 text-blue-600"
                />
              </div>
              <h3 className="text-lg font-semibold mb-1">{t.howToFind.step1.title}</h3>
              <p className="text-gray-600 text-sm">{t.howToFind.step1.description}</p>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-md">
              <div className="flex justify-center mb-2">
                <Image
                  src="/Logos/camera2.svg"
                  alt="Search"
                  width={32}
                  height={32}
                  className="w-8 h-8 text-blue-600"
                />
              </div>
              <h3 className="text-lg font-semibold mb-1">{t.howToFind.step2.title}</h3>
              <p className="text-gray-600 text-sm">{t.howToFind.step2.description}</p>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-md">
              <div className="flex justify-center mb-2">
                <Image
                  src="/Logos/shopping-cart.svg"
                  alt="Shopping"
                  width={32}
                  height={32}
                  className="w-8 h-8 text-blue-600"
                />
              </div>
              <h3 className="text-lg font-semibold mb-1">{t.howToFind.step3.title}</h3>
              <p className="text-gray-600 text-sm">{t.howToFind.step3.description}</p>
            </div>
          </div>
          
          {/* Mobile version - horizontal */}
          <div className="md:hidden flex justify-between gap-2">
            <div className="flex-1 bg-white p-2 rounded-lg shadow-md text-center">
              <div className="flex justify-center mb-1">
                <Image
                  src="/Logos/Calendar.svg"
                  alt="Calendar"
                  width={20}
                  height={20}
                  className="w-5 h-5 text-blue-600"
                />
              </div>
              <h3 className="text-xs font-semibold">{t.howToFind.step1.title}</h3>
            </div>
            <div className="flex-1 bg-white p-2 rounded-lg shadow-md text-center">
              <div className="flex justify-center mb-1">
                <Image
                  src="/Logos/camera2.svg"
                  alt="Search"
                  width={20}
                  height={20}
                  className="w-5 h-5 text-blue-600"
                />
              </div>
              <h3 className="text-xs font-semibold">{t.howToFind.step2.title}</h3>
            </div>
            <div className="flex-1 bg-white p-2 rounded-lg shadow-md text-center">
              <div className="flex justify-center mb-1">
                <Image
                  src="/Logos/shopping-cart.svg"
                  alt="Shopping"
                  width={20}
                  height={20}
                  className="w-5 h-5 text-blue-600"
                />
              </div>
              <h3 className="text-xs font-semibold">{t.howToFind.step3.title}</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}