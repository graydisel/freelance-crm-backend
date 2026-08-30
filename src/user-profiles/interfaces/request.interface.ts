export interface RequestWithUser extends Request {
    user: {
        sub: string;
        role: string;
        email: string;
    };
}
