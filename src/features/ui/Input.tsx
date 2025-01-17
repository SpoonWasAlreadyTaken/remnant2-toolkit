type Props = {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onKeyDown?: () => void
  value: string
  placeholder?: string
  id?: string
}

export function Input({
  onChange,
  onKeyDown,
  value,
  placeholder = '',
  id,
}: Props) {
  return (
    <input
      id={id}
      type="text"
      onChange={onChange}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && onKeyDown) onKeyDown()
      }}
      className="border-secondary-500 focus:ring-secondary-500 block w-full rounded-md border-2 bg-white/5 py-2 text-sm text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset"
      placeholder={placeholder}
      value={value}
    />
  )
}
