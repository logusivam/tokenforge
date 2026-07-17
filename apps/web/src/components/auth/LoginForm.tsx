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
    defaultValues: { email: '', password: '', rememberMe: false },
  })
  const { login } = useAuth()
  const navigate = useNavigate()
  const [errorMsg, setErrorMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const onSubmit = async (data: any) => {
    setErrorMsg('')
    setLoading(true)
    try {
      await login(data.email, data.password)
      navigate('/')
    } catch (err: any) {
      if (err.response?.status === 429) {
        setErrorMsg('Too many attempts. Try again in 60s.')
      } else {
        setErrorMsg(err.response?.data?.message || 'Invalid credentials.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-5 w-full">
      <div className="flex flex-col gap-3">
        <OAuthButtons />
        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-slate-800"></div>
          <span className="flex-shrink mx-4 text-slate-500 text-xs uppercase tracking-widest">
            or
          </span>
          <div className="flex-grow border-t border-slate-800"></div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-full">
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

        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 8, message: 'Password must be at least 8 characters' },
            })}
          />
          <button
            type="button"
            onClick={() => {
              setShowPassword(!showPassword)
            }}
            className="absolute right-3 top-[38px] text-xs text-slate-400 hover:text-slate-200 transition"
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>

        <div className="flex items-center justify-between text-xs py-1">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              className="accent-indigo-600 rounded bg-[#0b0f19] border-slate-800"
              {...register('rememberMe')}
            />
            <span className="text-slate-400">Remember Me</span>
          </label>
          <a
            href="/forgot-password"
            onClick={(e) => {
              e.preventDefault()
              window.alert(
                'Password recovery flow is not in backend scope. Please use registration to create test accounts.'
              )
            }}
            className="text-indigo-400 hover:underline"
          >
            Forgot Password?
          </a>
        </div>

        <Button type="submit" isLoading={loading} className="w-full mt-2">
          Sign In
        </Button>
      </form>
    </div>
  )
}
