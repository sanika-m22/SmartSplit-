import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: string;
}

const auth = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No authentication token, authorization denied' });
    }

    const isCustomAuth = token.length < 500;

    let decodedData: any;

    if (token && isCustomAuth) {
      decodedData = jwt.verify(token, process.env.JWT_SECRET as string);
      req.userId = decodedData?.id;
    } else {
      // For Google OAuth if we decide to add it later
      decodedData = jwt.decode(token);
      req.userId = decodedData?.sub;
    }

    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

export default auth;
