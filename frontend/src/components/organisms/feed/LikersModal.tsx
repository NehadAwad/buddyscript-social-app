"use client";

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { listLikers } from "@/lib/likes";
import type { LikeTargetType, LikerUser } from "@/types/like";
import { Avatar } from "@/components/atoms";

interface LikersModalProps {
  targetId: string;
  targetType: LikeTargetType;
  title?: string;
  onClose: () => void;
}

export function LikersModal({
  targetId,
  targetType,
  title = "People who liked this",
  onClose,
}: LikersModalProps) {
  const [users, setUsers] = useState<LikerUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const result = await listLikers(targetId, targetType);
        if (active) {
          setUsers(result.users);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof ApiError ? err.message : "Failed to load likers");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [targetId, targetType]);

  return (
    <div
      className="modal fade show d-block"
      role="dialog"
      aria-modal="true"
      style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-dialog-centered"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-content _feed_inner_area _b_radious6">
          <div className="modal-header border-0 _padd_l24 _padd_r24 _padd_t24">
            <h5 className="modal-title _title5">{title}</h5>
            <button type="button" className="btn-close" aria-label="Close" onClick={onClose} />
          </div>
          <div className="modal-body _padd_l24 _padd_r24 _padd_b24">
            {loading ? <p>Loading...</p> : null}
            {error ? <p className="text-danger">{error}</p> : null}
            {!loading && !error && users.length === 0 ? (
              <p>No likes yet.</p>
            ) : null}
            <ul className="list-unstyled _mar_t0">
              {users.map((user) => (
                <li key={user.id} className="_dis_flex _dis_flex_cntr1 _mar_b16">
                  <Avatar src={user.avatarUrl} className="_comment_img1" />
                  <span className="_mar_l12">
                    {user.firstName} {user.lastName}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
