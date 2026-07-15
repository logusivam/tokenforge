import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { authService } from '../../services/auth.service'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { PasswordStrengthBar } from './PasswordStrengthBar'

export function RegisterForm() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: { name: '', email: '', password: '' },
  })
  const navigate = useNavigate()
  const [errorMsg, setErrorMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const passwordValue = watch('password', '')

  const onSubmit = async (data: any) => {
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

      <PasswordStrengthBar password={passwordValue} />

      <Button type="submit" isLoading={loading} className="w-full mt-2">
        Create Account
      </Button>
    </form>
  )
}
