import MusicPlayer from '@/components/public/about/MusicPlayer'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-50 scale-75 md:scale-100 origin-bottom-right">
        <MusicPlayer />
      </div>
    </>
  )
}
