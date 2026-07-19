import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, Link } from 'react-router-dom'
import { authService } from '../../services/auth.service'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { PasswordStrengthBar } from './PasswordStrengthBar'
import { OAuthButtons } from './OAuthButtons'

export function RegisterForm() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: { name: '', email: '', password: '', confirmPassword: '', terms: false },
  })
  const navigate = useNavigate()
  const [errorMsg, setErrorMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const passwordValue = watch('password', '')

  const onSubmit = async (data: any) => {
    if (!data.terms) {
      setErrorMsg('You must agree to the Terms of Service.')
      return
    }
    if (data.password !== data.confirmPassword) {
      setErrorMsg('Passwords do not match.')
      return
    }
    setErrorMsg('')
    setLoading(true)
    try {
      await authService.register(data.email, data.name, data.password)
      navigate('/login', { state: { registered: true } })
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Registration failed. Try again.')
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
          label="Full Name"
          type="text"
          placeholder="John Doe"
          error={errors.name?.message}
          {...register('name', {
            required: 'Name is required',
            minLength: { value: 2, message: 'Name must be at least 2 characters' },
          })}
        />

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
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 8, message: 'Password must be at least 8 characters' },
            })}
          />
        </div>

        <Input
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword', {
            required: 'Please confirm your password',
          })}
        />

        <PasswordStrengthBar password={passwordValue} />

        <label className="flex items-start gap-2.5 cursor-pointer select-none py-1">
          <input
            type="checkbox"
            className="mt-1 accent-indigo-600 rounded bg-[#0b0f19] border-slate-800"
            {...register('terms', { required: true })}
          />
          <span className="text-xs text-slate-400 leading-normal">
            I agree to the{' '}
            <Link to="/terms-of-service" className="text-indigo-400 hover:underline">
              Terms of Service
            </Link>
          </span>
        </label>

        <Button type="submit" isLoading={loading} className="w-full mt-2">
          Create Account
        </Button>
      </form>
    </div>
  )
}
