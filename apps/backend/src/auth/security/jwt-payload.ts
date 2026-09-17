export interface JwtPayload {
    sub: string;
    isGuest: boolean;
    sid?: string;
}