import type { OAuthConfig, OAuthUserConfig } from "next-auth/providers"

// 谷歌用户资料接口
interface GoogleProfile {
  sub: string
  name: string
  given_name: string
  family_name: string
  picture: string
  email: string
  email_verified: boolean
  locale: string
}

export default function GoogleProvider<P extends GoogleProfile>(
  options: OAuthUserConfig<P>
): OAuthConfig<P> {
  return {
    id: "google",
    name: "Google",
    type: "oauth",
    authorization: {
      url: "https://accounts.google.com/oauth/authorize",
      params: {
        scope: "openid email profile",
        response_type: "code",
        access_type: "offline",
        prompt: "consent",
      },
    },
    token: "https://oauth2.googleapis.com/token",
    userinfo: "https://www.googleapis.com/oauth2/v2/userinfo",
    profile(profile) {
      return {
        id: profile.sub,
        name: profile.name,
        email: profile.email,
        image: profile.picture,
        googleId: profile.sub,
      }
    },
    options,
  }
}