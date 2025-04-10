import createError from 'http-errors';
import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import dotenv from 'dotenv';

import indexRouter from './routes/index';

dotenv.config();

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // set locals, only providing error in development
  if (err instanceof Error) {
    res.locals.message = err.message;
  }
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  const statusCode = (err as { status?: number })?.status ?? 500;
  res.status(statusCode);
  res.render('error');
});

export default app;
