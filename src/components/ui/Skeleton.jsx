import clsx from 'clsx';

export default function Skeleton({ className, ...props }) {
  return <div className={clsx('skeleton', className)} {...props} />;
}
