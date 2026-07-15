import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { OAuthButtons } from './OAuthButtons'

export function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { email: '', password: '' },
  })
  const { login } = useAuth()
  const navigate = useNavigate()
  const [errorMsg, setErrorMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (data: any) => {
    setErrorMsg('')
    setLoading(true)
    try {
      await login(data.email, data.password)
      navigate('/')
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 w-full">
      {errorMsg ? (
        <div className="bg-rose-500/10 border border-rose-500/25 text-rose-400 p-3 rounded-lg text-sm font-medium animate-pulse">
          {errorMsg}
        </div>
      ) : null}

      <Input
        label="Email Address"
        type="email"
        placeholder="you@example.com"
        error={errors.email?.message}
        {...register('email', {
          required: 'Email is required',
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: 'Invalid email address',
          },
        })}
      />

      <Input
        label="Password"
        type="password"
        placeholder="••••••••"
        error={errors.password?.message}
        {...register('password', {
          required: 'Password is required',
          minLength: { value: 8, message: 'Password must be at least 8 characters' },
        })}
      />

      <Button type="submit" isLoading={loading} className="w-full">
        Sign In
      </Button>

      <div className="relative my-2 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-800"></div>
        </div>
        <span className="relative px-3 bg-[#0d1321] text-xs font-semibold uppercase tracking-wider text-slate-500">
          Or continue with
        </span>
      </div>

      <OAuthButtons />
    </form>
  )
}
